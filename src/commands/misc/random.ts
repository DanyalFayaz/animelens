import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "@classes/client";
import type { Character } from "@interfaces/character";
import type { Manga } from "@interfaces/manga";
import type { Anime } from "@interfaces/anime";
import { chooseEmbed, get } from "@util/funcs";
import { Command } from "@classes/command";
import { emojis } from "@util/constants";

export default class RandomCommand extends Command {
	constructor() {
		super({
			name: "random",
			description: "Get a random anime, manga or character.",
			options: [
				{
					name: "type",
					description: "The type of trending content to show.",
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: [
						{ name: "Anime", value: "anime" },
						{ name: "Manga", value: "manga" },
						{ name: "Character", value: "characters" },
					],
				},
			],
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
        const type = interaction.options.getString("type", true);
		await interaction.deferReply();

		const data = await get<{ data: Manga | Anime | Character }>(
			interaction,
			`https://api.jikan.moe/v4/random/${type}`,
			0,
		);

		if (!data?.data) {
			return;
		}

		const manga = data.data;

		const RandomEmbed = chooseEmbed(type)(interaction, manga as any);

		const components: ButtonBuilder[] = [];
		if (manga.url) {
			components.push(
				new ButtonBuilder()
					.setLabel("View on MyAnimeList")
					.setEmoji(emojis.myanimelist)
					.setStyle(ButtonStyle.Link)
					.setURL(manga.url),
			);
		}

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			...components,
		);

		await interaction.editReply({
			embeds: [RandomEmbed],
			components: row ? [row] : [],
		});
	}
}
