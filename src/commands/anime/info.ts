import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "@classes/client";
import type { Anime } from "@interfaces/anime";
import { baseEmbed, capitalize, get } from "@util/funcs";
import { Command } from "@classes/command";
import { emojis } from "@util/constants";

export default class InfoCommand extends Command {
	constructor() {
		super({
			name: "info",
			description: "Get information about an anime",
			category: "anime",
			cooldown: 10,
			options: [
				{
					name: "title",
					type: ApplicationCommandOptionType.String,
					description: "The anime to search for",
					required: true,
				},
				{
					name: "min_score",
					type: ApplicationCommandOptionType.String,
					description: "The minimum score to filter by (1-10)",
					required: false,
				},
				{
					name: "max_score",
					type: ApplicationCommandOptionType.String,
					description: "The maximum score to filter by (1-10)",
					required: false,
				},
				{
					name: "sfw",
					type: ApplicationCommandOptionType.Boolean,
					description: "Whether to filter by safe-for-work content",
					required: false,
				},
				{
					name: "status",
					type: ApplicationCommandOptionType.String,
					description: "The status to filter by",
					required: false,
					choices: [
						{ name: "airing", value: "airing" },
						{ name: "complete", value: "complete" },
						{ name: "upcoming", value: "upcoming" },
					],
				},
				{
					name: "type",
					type: ApplicationCommandOptionType.String,
					description: "The type to filter by",
					required: false,
					choices: [
						{ name: "tv", value: "Television" },
						{ name: "movie", value: "Motion Picture" },
						{ name: "ova", value: "Original Video Animation" },
						{ name: "ona", value: "Original Net Animation" },
						{ name: "special", value: "Special Episode" },
						{ name: "music", value: "Music Video / Music-related release" },
						{ name: "cm", value: "Commercial" },
						{ name: "pv", value: "Promotional Video" },
						{ name: "tv_special", value: "Television Special" },
					],
				},
				{
					name: "rating",
					type: ApplicationCommandOptionType.String,
					description: "The rating to filter by",
					required: false,
					choices: [
						{ name: "g", value: "General Audiences" },
						{ name: "pg", value: "Parental Guidance" },
						{ name: "pg13", value: "Parents Strongly Cautioned / 13+" },
						{ name: "r17", value: "Restricted 17+" },
						{ name: "r", value: "Restricted" },
						{ name: "rx", value: "Adult Only / Hentai" },
					],
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

		const minScore = interaction.options.getString("min_score");
		const maxScore = interaction.options.getString("max_score");
		const sfw = interaction.options.getBoolean("sfw");
		const status = interaction.options.getString("status");
		const type = interaction.options.getString("type");
		const rating = interaction.options.getString("rating");

		if (
			minScore &&
			(isNaN(Number(minScore)) || Number(minScore) < 1 || Number(minScore) > 10)
		) {
			await interaction.editReply(
				"Minimum score must be a number between 1 and 10.",
			);
			return;
		}

		if (
			maxScore &&
			(isNaN(Number(maxScore)) || Number(maxScore) < 1 || Number(maxScore) > 10)
		) {
			await interaction.editReply(
				"Maximum score must be a number between 1 and 10.",
			);
			return;
		}

		if (minScore && maxScore && Number(minScore) > Number(maxScore)) {
			await interaction.editReply(
				"Minimum score cannot be greater than maximum score.",
			);
			return;
		}

		const params = new URLSearchParams();
		if (minScore) params.append("min_score", minScore);
		if (maxScore) params.append("max_score", maxScore);
		if (sfw !== null) params.append("sfw", sfw.toString());
		if (status) params.append("status", status);
		if (type) params.append("type", type);
		if (rating) params.append("rating", rating);
		const URL = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
			query,
		)}&limit=5&${params.toString()}`;

		const data = await get<{ data: Anime[] }>(interaction, URL, 30);

		if (!data.data) {
			return;
		}

		if (data.data.length === 0) {
			await interaction.editReply(
				`No results found for anime: ${inlineCode(query)}`,
			);
			return;
		}

		const first = data.data[0]!;

		const infoEmbed = baseEmbed({
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
					.setEmoji(emojis.myanimelist)
					.setStyle(ButtonStyle.Link)
					.setURL(first.url),
			);
		}
		if (first.trailer) {
			components.push(
				new ButtonBuilder()
					.setLabel("View Trailer")
					.setEmoji(emojis.youtube)
					.setStyle(ButtonStyle.Link)
					.setURL(first.trailer?.url ?? first.url),
			);
		}

		const rows =
			components.length > 0
				? [new ActionRowBuilder<ButtonBuilder>().addComponents(...components)]
				: [];

		await interaction.editReply({
			embeds: [infoEmbed],
			components: rows,
		});
	}
}
