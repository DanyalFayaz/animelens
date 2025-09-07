import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import type DiscordClient from "../../classes/client";
import { Command } from "../../classes/command";
import type { Quote } from "../../types/quote";
import { baseEmbed, get } from "../../util/funcs";

export default class QuoteCommand extends Command {
	constructor() {
		super({
			name: "quote",
			description: "Get a random anime quote",
			category: "anime",
			options: [
				{
					name: "show",
					description: "The anime to get a quote from",
					type: ApplicationCommandOptionType.String,
					required: false,
				},
				{
					name: "character",
					description: "The character to get a quote from",
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		});
	}

		override async execute(
			client: DiscordClient,
			interaction: ChatInputCommandInteraction
		): Promise<void> {
			await interaction.deferReply();
		const show = interaction.options.getString("show", false);
		const character = interaction.options.getString("character", false);

		const URL = show
			? `https://yurippe.vercel.app/api/quotes?show=${encodeURIComponent(
					show
			  )}&random=1`
			: character
			? `https://yurippe.vercel.app/api/quotes?character=${encodeURIComponent(
					character
			  )}&random=1`
			: "https://yurippe.vercel.app/api/quotes?random=1";

		const data = await get<Quote[]>(interaction, URL, 0);

		if (!data) {
			return;
		}

		if (data.length === 0) {
			await interaction.editReply({
				content: "No quotes found for the given show or character.",
			});
			return;
		}

		const quoteData = data[0]!;
		const QuoteEmbed = baseEmbed({
			author: {
				name: `${quoteData.character} (from ${quoteData.show})`,
			},
			description: `_"${quoteData.quote}"_`,
		});

		await interaction.editReply({ embeds: [QuoteEmbed] });
	}
}
