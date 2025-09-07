import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "@classes/client";
import type { Producer } from "@interfaces/producer";
import { baseEmbed, get } from "@util/funcs";
import { Command } from "@classes/command";
import { emojis } from "@util/constants";

export default class ProduerCommand extends Command {
	constructor() {
		super({
			name: "producer",
			description: "Get information about an anime producer",
			category: "anime",
			cooldown: 10,
			options: [
				{
					name: "name",
					description: "Name of the producer",
					type: 3,
					required: true,
				},
			],
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const query = interaction.options.getString("name", true);
		await interaction.deferReply();

		const data = await get<{ data: Producer[] }>(
			interaction,
			`https://api.jikan.moe/v4/producers?q=${encodeURIComponent(query)}&order_by=favorites&sort=desc&limit=5`,
			30
		);

		if (!data.data) {
			return;
		}

		if (data.data.length === 0) {
			await interaction.editReply(`No producers found matching: ${query}`);
			return;
		}

		const producer = data.data[0]!;
		const ProducerEmbed = baseEmbed({
			author: { name: query, iconURL: interaction.user.displayAvatarURL() },
			title: producer.titles[0]!.title,
			url: producer.url,
			description: producer.about
				? producer.about.substring(0, 4096)
				: "No description available.",
			thumbnail: { url: producer.images.jpg.image_url },
			fields: [
				{
					name: "🎌 Japanese Name",
					value:
						producer.titles.find((t) => t.type === "Japanese")?.title ??
						"Unknown",
					inline: true,
				},
				{
					name: "❤️ Favorites",
					value: producer.favorites.toLocaleString() ?? "N/A",
					inline: true,
				},
				{
					name: "🏢 Established",
					value: new Intl.DateTimeFormat("en-US", {
						year: "numeric",
						month: "long",
						day: "2-digit",
						weekday: "long",
					}).format(new Date(producer.established!)),
					inline: false,
				},
			],
		});

		const row = producer.url
			? new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel("View on MyAnimeList")
						.setEmoji(emojis.myanimelist)
						.setStyle(ButtonStyle.Link)
						.setURL(producer.url),
				)
			: null;

		await interaction.editReply({
			embeds: [ProducerEmbed],
			components: row ? [row] : [],
		});
	}
}
