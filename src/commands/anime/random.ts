import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ChatInputCommandInteraction } from "discord.js";
import type DiscordClient from "../../classes/client";
import { Command } from "../../classes/command";
import type { Anime } from "../../types/anime";
import { baseEmbed, capitalize, get } from "../../util/funcs";
import { emojis } from "../../util/constants";

export default class RandomCommand extends Command {
	constructor() {
		super({
			name: "random",
			category: "anime",
			description: "Get a random anime recommendation.",
		});
	}

		override async execute(
			client: DiscordClient,
			interaction: ChatInputCommandInteraction
		): Promise<void> {
	        await interaction.deferReply();

		const data = await get<{ data: Anime }>(interaction, "https://api.jikan.moe/v4/random/anime", 0);

		if (!data.data) {
			return;
		}

		const anime = data.data;

		const RandomEmbed = baseEmbed({
			author: { name: "Random", iconURL: interaction.user.displayAvatarURL() },
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
					value: anime.episodes
						? `${anime.episodes} (${anime.duration})`
						: "N/A",
					inline: true,
				},
				{
					name: "⭐ Score",
					value: anime.score?.toString() ?? "N/A",
					inline: true,
				},
				{ name: "📅 Aired", value: anime.aired.string ?? "N/A", inline: false },
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

		const components: ButtonBuilder[] = [];
		if (anime.url) {
			components.push(
				new ButtonBuilder()
					.setLabel("View on MyAnimeList")
					.setEmoji(emojis.myanimelist)
					.setStyle(ButtonStyle.Link)
					.setURL(anime.url)
			);
		}
		if (anime.trailer) {
			components.push(
				new ButtonBuilder()
					.setLabel("View Trailer")
					.setEmoji(emojis.youtube)
					.setStyle(ButtonStyle.Link)
					.setURL(anime.trailer?.url ?? anime.url)
			);
		}

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			...components
		);

        await interaction.editReply({ embeds: [RandomEmbed], components: row ? [row] : [] });
	}
}
