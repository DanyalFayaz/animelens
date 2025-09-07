import {
	ActionRowBuilder,
	bold,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "../../classes/client";
import type { AnimeTheme } from "../../types/theme";
import { baseEmbed, get } from "../../util/funcs";
import { Command } from "../../classes/command";

export default class SongCommand extends Command {
	constructor() {
		super({
			name: "song",
			description: "Get information about an anime song",
			category: "anime",
			options: [
				{
					name: "title",
					type: ApplicationCommandOptionType.String,
					description: "The anime song to search for",
					required: true,
				},
			],
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		const query = interaction.options.getString("title", true);
		await interaction.deferReply();

		const data = await get<{
			search: { animethemes: AnimeTheme[] };
		}>(
			interaction,
			`https://api.animethemes.moe/search?q=${encodeURIComponent(
				query
			)}&fields[search]=animethemes&include[animetheme]=animethemeentries.videos.audio,anime.images,song.artists,group`,
			30
		);

		if (!data.search) {
			return;
		}

		if (data.search.animethemes.length === 0) {
			await interaction.editReply(
				`No results found for anime song: ${inlineCode(query)}`
			);
			return;
		}

		const first = data.search.animethemes[0]!;
		const firstVideo = first.animethemeentries?.[0]?.videos?.[0];
		const songURL = firstVideo
			? `https://animethemes.moe/anime/${first.anime.slug}/${first.slug}-${firstVideo?.tags}`
			: undefined;

		const SongEmbed = baseEmbed({
			author: { name: query, iconURL: interaction.user.displayAvatarURL() },
			title: first.song.title,
			url: songURL,
			description: `${bold(first.anime.name || "N/A")}\n\n${
				first.anime.synopsis
					.substring(0, 2048)
					.replace(/\n+\(Source: .*?\)$/, "") || "No synopsis available."
			}`,
			thumbnail: {
				url: first.anime.images[0]?.link || "https://via.placeholder.com/150",
			},
			footer: { text: "Data courtesy of AnimeThemes API" },
			fields: [
				{
					name: "🎵 Sequence",
					value:
						first.type === "OP"
							? `Opening ${first.sequence ?? ""}`
							: first.type === "ED"
							? `Ending ${first.sequence ?? ""}`
							: `Insert ${first.sequence ?? ""}`,
					inline: true,
				},
				{
					name: "🎤 Artists",
					value:
						first.song.artists.length > 0
							? first.song.artists.map((artist) => artist.name).join(", ")
							: "N/A",
					inline: true,
				},
			],
		});

		const components: ButtonBuilder[] = [];
		if (songURL) {
			components.push(
				new ButtonBuilder()
					.setLabel("Watch on AniThemes")
					.setEmoji("<:animethemes:1414137799313064019>")
					.setStyle(ButtonStyle.Link)
					.setURL(songURL)
			);
		}
		components.push(
			new ButtonBuilder()
				.setLabel("YouTube Search")
				.setEmoji("<:youtube:1414137041620570142>")
				.setStyle(ButtonStyle.Link)
				.setURL(
					`https://www.youtube.com/results?search_query=${encodeURIComponent(
						`${first.song.title} ${first.anime.name || ""}`.trim()
					)}`
				),
			new ButtonBuilder()
				.setLabel("Spotify Search")
				.setEmoji("<:spotify:1414138589637509120>")
				.setStyle(ButtonStyle.Link)
				.setURL(
					`https://open.spotify.com/search/${encodeURIComponent(
						`${first.song.title} ${first.anime.name || ""}`.trim()
					)}`
				)
		);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			...components
		);

		await interaction.editReply({
			embeds: [SongEmbed],
			components: row ? [row] : [],
		});
	}
}
