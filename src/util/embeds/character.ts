import type { CommandInteraction } from "discord.js";
import type { Character } from "@interfaces/character";
import { baseEmbed, formatCharAbout } from "@util/funcs";

export default function characterInfoEmbed(
	interaction: CommandInteraction,
	character: Character,
    authorName = "Character",
) {
	return baseEmbed({
		author: { name: authorName, iconURL: interaction.user.displayAvatarURL() },
		title: character.name,
		url: character.url,
		description: character.about
			? formatCharAbout(
					character.about.replace(/\n+\(Source: .*?\)$/, ""),
				).substring(0, 4096)
			: "No description available.",
		thumbnail: { url: character.images.jpg.image_url },
		footer: { text: "Data courtesy of MyAnimeList via Jikan API" },
		fields: [
			{
				name: "🎌 Japanese Name",
				value: character.name_kanji || "Unknown",
				inline: true,
			},
			{
				name: "🗿 Nicknames",
				value: character.nicknames.join(", ") || "None",
				inline: true,
			},
			{
				name: "🏆 Favorites",
				value: character.favorites.toLocaleString("en-US") || "0",
				inline: true,
			},
		],
	});
}
