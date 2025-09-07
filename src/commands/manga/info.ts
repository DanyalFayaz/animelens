import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "@classes/client";
import type { Manga } from "@interfaces/manga";
import { baseEmbed, get } from "@util/funcs";
import { Command } from "@classes/command";
import { emojis } from "@util/constants";

export default class MangaInfoCommand extends Command {
	constructor() {
		super({
			name: "info",
			description: "Get information about a specific manga.",
			category: "manga",
			cooldown: 10,
			options: [
				{
					name: "title",
					type: ApplicationCommandOptionType.String,
					description: "The title of the manga to get information about.",
					required: true,
				},
			],
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		const title = interaction.options.getString("title", true);
		await interaction.deferReply();

		const data = await get<{ data: Manga[] }>(
			interaction,
			`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(title)}&limit=1`,
			30
		);

		if (!data.data) {
			return;
		}

		if (data.data.length === 0) {
			await interaction.editReply({
				content: `No manga found with the title: ${inlineCode(title)}.`,
			});
			return;
		}

		const manga = data.data[0]!;

		const MangaInfoEmbed = baseEmbed({
			author: { name: title, iconURL: interaction.user.displayAvatarURL() },
			title: manga.title,
			url: manga.url,
			description:
				manga.synopsis
					?.substring(0, 4096)
					.replace("\n\n[Written by MAL Rewrite]", "") ??
				"No synopsis available.",
			thumbnail: { url: manga.images.jpg.image_url },
			footer: { text: "Data courtesy of MyAnimeList via Jikan API" },
			fields: [
				{ name: "📖 Type", value: manga.type ?? "N/A", inline: true },
				{
					name: "📚 Chapters",
					value: manga.chapters ? `${manga.chapters}` : "N/A",
					inline: true,
				},
				{
					name: "🏷️ Volumes",
					value: manga.volumes?.toString() ?? "N/A",
					inline: true,
				},
				{
					name: "⭐ Score",
					value: manga.score?.toString() ?? "N/A",
					inline: true,
				},
				{ name: "🏷️ Status", value: manga.status ?? "N/A", inline: true },
				{
					name: "🏆 Rank",
					value: manga.rank ? `#${manga.rank}` : "N/A",
					inline: true,
				},
				{
					name: "📈 Popularity",
					value: manga.popularity ? `#${manga.popularity}` : "N/A",
					inline: true,
				},
				{
					name: "👥 Members",
					value: manga.members?.toLocaleString() ?? "N/A",
					inline: true,
				},
				{
					name: "❤️ Favorites",
					value: manga.favorites?.toLocaleString() ?? "N/A",
					inline: true,
				},
				{
					name: "📅 Published",
					value: manga.published.string ?? "N/A",
					inline: false,
				},
				{
					name: "✍️ Authors",
					value: manga.authors?.map((a) => a.name).join(", ") || "N/A",
					inline: false,
				},
				{
					name: "🎭 Genres",
					value: manga.genres?.map((g) => g.name).join(", ") || "N/A",
					inline: false,
				},
			],
		});

		const components: ButtonBuilder[] = [];
		if (manga.url) {
			components.push(
				new ButtonBuilder()
					.setLabel("View on MyAnimeList")
					.setEmoji(emojis.myanimelist)
					.setStyle(ButtonStyle.Link)
					.setURL(manga.url)
			);
		}

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			...components
		);

		await interaction.editReply({
			embeds: [MangaInfoEmbed],
			components: row ? [row] : [],
		});
	}
}
