import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from "discord.js";
import characterInfoEmbed from "@util/embeds/character";
import type { Character } from "@interfaces/character";
import type DiscordClient from "@classes/client";
import { Command } from "@classes/command";
import { emojis } from "@util/constants";
import { get } from "@util/funcs";

export default class CharactersInfoCommand extends Command {
	constructor() {
		super({
			name: "info",
			description: "Get information about a character",
			category: "characters",
			cooldown: 10,
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

		if (!data.data) {
			return;
		}

		if (data.data.length === 0) {
			await interaction.editReply(
				`No characters found matching: ${inlineCode(query)}`,
			);
			return;
		}

		const character = data.data[0]!;
		const CharacterEmbed = characterInfoEmbed(interaction, character);

		const row = character.url
			? new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel("View on MyAnimeList")
						.setEmoji(emojis.myanimelist)
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
