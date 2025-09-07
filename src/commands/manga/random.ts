import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ChatInputCommandInteraction } from "discord.js";
import type DiscordClient from "../../classes/client";
import { Command } from "../../classes/command";
import type { Manga } from "../../types/manga";
import { baseEmbed, get } from "../../util/funcs";
import mangaInfoEmbed from "../../util/embeds/manga";

export default class RandomMangaCommand extends Command {
	constructor() {
		super({
			name: "random",
			description: "Get a random manga recommendation.",
			category: "manga",
		});
	}

		override async execute(
			client: DiscordClient,
			interaction: ChatInputCommandInteraction
		): Promise<void> {
			await interaction.deferReply();

		const data = await get<{ data: Manga }>(interaction, "https://api.jikan.moe/v4/random/manga", 0);

		if (!data.data) {
			return;
		}

		const manga = data.data;

		const RandomEmbed = mangaInfoEmbed(interaction, manga);

        const components: ButtonBuilder[] = [];
        if (manga.url) {
            components.push(
                new ButtonBuilder()
                    .setLabel("View on MyAnimeList")
                    .setEmoji("<:myanimelist:1414137135082115112>")
                    .setStyle(ButtonStyle.Link)
                    .setURL(manga.url)
            );
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...components
        );

		await interaction.editReply({
			embeds: [RandomEmbed],
			components: row ? [row] : [],
		});
	}
}
