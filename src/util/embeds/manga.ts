import type { CommandInteraction } from "discord.js";
import { baseEmbed } from "@util/funcs";
import type { Manga } from "@interfaces/manga";

export default function mangaInfoEmbed(
	interaction: CommandInteraction,
	manga: Manga
) {
	return baseEmbed({
		author: { name: "Random", iconURL: interaction.user.displayAvatarURL() },
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
		],
	});
}
