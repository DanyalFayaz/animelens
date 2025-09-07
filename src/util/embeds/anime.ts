import type { CommandInteraction } from "discord.js";
import type { Anime } from "../../types/anime";
import { baseEmbed, capitalize } from "../funcs";

export default function animeInfoEmbed(interaction: CommandInteraction, anime: Anime, authorName = "Trending") {
	return baseEmbed({
		author: {
			name: authorName,
			iconURL: interaction.user.displayAvatarURL(),
		},
		title: anime.title,
		url: anime.url,
		description:
			anime.synopsis
				?.substring(0, 4096)
				.replace("\n\n[Written by MAL Rewrite]", "") ??
			"No synopsis available.",
		thumbnail: { url: anime.images.jpg.image_url },
		footer: { text: "Data courtesy of MyAnimeList via Jikan API" },
		fields: [
			{ name: "📺 Type", value: anime.type ?? "N/A", inline: true },
			{
				name: "🎬 Episodes",
				value: anime.episodes ? `${anime.episodes} (${anime.duration})` : "N/A",
				inline: true,
			},
			{
				name: "⭐ Score",
				value: anime.score?.toString() ?? "N/A",
				inline: true,
			},
			{
				name: "📅 Aired",
				value: anime.aired.string ?? "N/A",
				inline: false,
			},
			{ name: "🏷️ Status", value: anime.status ?? "N/A", inline: true },
			{
				name: "🌐 Season",
				value: anime.season
					? `${capitalize(anime.season)} ${anime.year ?? ""}`.trim()
					: "N/A",
				inline: true,
			},
		],
	});
}
