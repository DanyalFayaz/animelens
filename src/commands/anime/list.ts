import type DiscordClient from "@classes/client";
import type { ChatInputCommandInteraction } from "discord.js";
import type { ListAnime, MALAnime } from "@interfaces/mal-api";
import type { User } from "@util/db/generated/prisma";
import { Pagination, type PaginationItem } from "@discordx/pagination";
import { baseEmbed, capitalize, get } from "@util/funcs";
import { Command } from "@classes/command";
import { apis } from "@util/constants";

const LIST_FIELDS =
	"start_date,end_date,alternative_titles,synopsis,rank,popularity,num_list_users,num_scoring_users,media_type,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics";

export default class ListCommand extends Command {
	constructor() {
		super({
			name: "list",
			description: "List all anime in your MyAnimeList list.",
			category: "anime",
			authentication: true,
		});
	}

	override async execute(
		_client: DiscordClient,
		interaction: ChatInputCommandInteraction,
		user: User,
	): Promise<void> {
		await interaction.deferReply();

		const list = await get<{ data: ListAnime[] }>(
			interaction,
			`${apis.myanimelist}/users/${user.malUsername}/animelist?limit=100&sort=list_score&fields=list_status`,
			300,
			{ Authorization: `Bearer ${user.malAccessToken}` },
		);
		if (!list.data || list.data.length === 0) return;

		const selected = list.data.slice(0, 10);

		await Promise.all(
			selected.map(async (item) => {
				const details = await get<MALAnime>(
					interaction,
					`${apis.myanimelist}/anime/${item.node.id}?fields=${LIST_FIELDS}`,
					300,
					{ Authorization: `Bearer ${user.malAccessToken}` },
				);
				item.detailed = details;
			}),
		);

		const pages: PaginationItem[] = selected.map((s, i) => {
			const anime = s.detailed!;

			return {
				embeds: [
					baseEmbed({
						author: {
							name: user.malUsername ?? interaction.user.username,
							iconURL: interaction.user.displayAvatarURL(),
						},
						title: `${i + 1}. ${anime.title}`,
						url: `https://myanimelist.net/anime/${anime.id}`,
						thumbnail: { url: anime.main_picture.medium },
						description:
							anime.synopsis
								?.substring(0, 4096)
								.replace("\n\n[Written by MAL Rewrite]", "") ??
							"No synopsis available.",
						footer: { text: "Data courtesy of MyAnimeList.net" },
						fields: [
							{
								name: "⭐ Your Score",
								value: `${s.list_status.score}`,
								inline: true,
							},
							{
								name: "📅 Status",
								value: capitalize(s.list_status.status.replaceAll(/_/g, " ")),
								inline: true,
							},
							{
								name: "📺 Episodes Watched",
								value: `${s.list_status.num_episodes_watched}/${anime.num_episodes ?? "??"}`,
								inline: true,
							},
							{
								name: "📺 Type",
								value: capitalize(anime.media_type) ?? "N/A",
								inline: true,
							},
							{
								name: "🏷️ Status",
								value: capitalize(anime.status.replaceAll("_", " ")) ?? "N/A",
								inline: true,
							},
							{
								name: "🌐 Season",
								value: `${capitalize(anime.start_season.season)} ${anime.start_season.year}`,
								inline: true,
							},
						],
					}),
				],
			};
		});

		await new Pagination(interaction, pages, {
			selectMenu: { disabled: true },
			buttons: { backward: { label: "Start" }, forward: { label: "End" } },
		}).send();
	}
}
