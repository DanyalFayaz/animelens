import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "../../classes/client";
import type { Character } from "../../types/character";
import { Command } from "../../classes/command";
import { baseEmbed, formatCharAbout, get } from "../../util/funcs";

export default class CharacterCommand extends Command {
	constructor() {
		super({
			name: "character",
			description: "Get information about an anime character",
			category: "anime",
			options: [
				{
					name: "name",
					type: ApplicationCommandOptionType.String,
					description: "The character to search for",
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

		const data = await get<{ data: Character[] }>(
			interaction,
			`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(
				query,
			)}&order_by=favorites&sort=desc&limit=5`,
			30,
		);

		if (data.data.length === 0) {
			await interaction.editReply(
				`No characters found matching: ${inlineCode(query)}`,
			);
			return;
		}

		const character = data.data[0]!;
		const CharacterEmbed = baseEmbed({
			author: { name: query, iconURL: interaction.user.displayAvatarURL() },
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

		const row = character.url
			? new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel("View on MyAnimeList")
						.setEmoji("<:myanimelist:1414137135082115112>")
						.setStyle(ButtonStyle.Link)
						.setURL(character.url),
				)
			: null;

		await interaction.editReply({
			embeds: [CharacterEmbed],
			components: row ? [row] : [],
		});
	}
}
