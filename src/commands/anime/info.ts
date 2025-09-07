import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "../../classes/client";
import { baseEmbed, capitalize } from "../../util/funcs";
import { Command } from "../../classes/command";
import type { Anime } from "../../types/anime";

export default class InfoCommand extends Command {
	constructor() {
		super({
			name: "info",
			description: "Get information about an anime",
			category: "anime",
			options: [
				{
					name: "title",
					type: ApplicationCommandOptionType.String,
					description: "The anime to search for",
					required: true,
				},
			],
		});
	}

	override async execute(
		_client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const query = interaction.options.getString("title", true);
		await interaction.deferReply();

		const response = await fetch(
			`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`,
		);

		if (!response.ok) {
			await interaction.editReply(
				`Error fetching anime data: ${response.status} ${response.statusText}`,
			);
			return;
		}

		const data = (await response.json()) as { data: Anime[] };

		if (data.data.length === 0) {
			await interaction.editReply(
				`No results found for anime: ${inlineCode(query)}`,
			);
			return;
		}

		const first = data.data[0]!;

		const animeInfoEmbed = baseEmbed({
			author: { name: query, iconURL: interaction.user.displayAvatarURL() },
			title: first.title,
			url: first.url,
			description:
				first.synopsis
					?.substring(0, 4096)
					.replace("\n\n[Written by MAL Rewrite]", "") ??
				"No synopsis available.",
			thumbnail: { url: first.images.jpg.image_url },
			footer: { text: "Data courtesy of MyAnimeList via Jikan API" },
			fields: [
				{ name: "📺 Type", value: first.type ?? "N/A", inline: true },
				{
					name: "🎬 Episodes",
					value: first.episodes
						? `${first.episodes} (${first.duration})`
						: "N/A",
					inline: true,
				},
				{
					name: "⭐ Score",
					value: first.score?.toString() ?? "N/A",
					inline: true,
				},
				{ name: "🏷️ Status", value: first.status ?? "N/A", inline: true },
				{
					name: "🌐 Season",
					value: first.season
						? `${capitalize(first.season)} ${first.year ?? ""}`.trim()
						: "N/A",
					inline: true,
				},
				{
					name: "🏆 Rank",
					value: first.rank ? `#${first.rank}` : "N/A",
					inline: true,
				},
				{
					name: "📈 Popularity",
					value: first.popularity ? `#${first.popularity}` : "N/A",
					inline: true,
				},
				{
					name: "👥 Members",
					value: first.members?.toLocaleString() ?? "N/A",
					inline: true,
				},
				{
					name: "❤️ Favorites",
					value: first.favorites?.toLocaleString() ?? "N/A",
					inline: true,
				},
				{ name: "📅 Aired", value: first.aired.string ?? "N/A", inline: false },
				{
					name: "🎬 Studios",
					value: first.studios?.map((s) => s.name).join(", ") || "N/A",
					inline: false,
				},
				{
					name: "🎭 Genres",
					value: first.genres?.map((g) => g.name).join(", ") || "N/A",
					inline: false,
				},
			],
		});

		const components: ButtonBuilder[] = [];
		if (first.url) {
			components.push(
				new ButtonBuilder()
					.setLabel("View on MyAnimeList")
					.setEmoji("<:myanimelist:1414137135082115112>")
					.setStyle(ButtonStyle.Link)
					.setURL(first.url),
			);
		}
		if (first.trailer) {
			components.push(
				new ButtonBuilder()
					.setLabel("View Trailer")
					.setEmoji("<:youtube:1414137041620570142>")
					.setStyle(ButtonStyle.Link)
					.setURL(first.trailer?.url ?? first.url),
			);
		}

		const rows =
			components.length > 0
				? [new ActionRowBuilder<ButtonBuilder>().addComponents(...components)]
				: [];

		await interaction.editReply({
			embeds: [animeInfoEmbed],
			components: rows,
		});
	}
}
