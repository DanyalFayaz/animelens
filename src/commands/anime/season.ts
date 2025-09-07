import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "../../classes/client";
import type { Anime } from "../../types/anime";
import { Pagination } from "@discordx/pagination";
import { Command } from "../../classes/command";
import animeInfoEmbed from "../../util/embeds/anime";
import { get } from "../../util/funcs";

export default class SeasonCommand extends Command {
	constructor() {
		super({
			name: "season",
			description: "Get anime seasonal information.",
			category: "anime",
			options: [
				{
					name: "year",
					description: "The year of the season.",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					minValue: 1950,
					maxValue: new Date().getFullYear() + 1,
				},
				{
					name: "season",
					description: "The season to get information for.",
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: [
						{ name: "Winter", value: "winter" },
						{ name: "Spring", value: "spring" },
						{ name: "Summer", value: "summer" },
						{ name: "Fall", value: "fall" },
					],
				},
			],
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		await interaction.deferReply();
		await interaction.editReply("Fetching anime seasonal information...");
		const year = interaction.options.getInteger("year", true);
		const season = interaction.options.getString("season", true);

		const data = await get<{ data: Anime[] }>(
			interaction,
			`https://api.jikan.moe/v4/seasons/${year}/${season}`,
			30
		);

		if (!data.data) {
			return;
		}

		const selected = data.data
			.sort(
				(a, b) =>
					(a.rank ?? Number.POSITIVE_INFINITY) -
					(b.rank ?? Number.POSITIVE_INFINITY),
			)
			.slice(0, 10);

		if (selected.length === 0) {
			await interaction.editReply(`No anime found for ${season} ${year}.`);
			return;
		}

		const embeds = selected.map(
			(a) =>
				({ content: null, embeds: [animeInfoEmbed(interaction, a)] }) as any,
		);
		const pagination = new Pagination(interaction, embeds, {
			selectMenu: {
				disabled: true,
			},
			buttons: {
				backward: {
					label: "Start",
				},
				forward: {
					label: "End",
				},
			},
		});
		await pagination.send();
	}
}
