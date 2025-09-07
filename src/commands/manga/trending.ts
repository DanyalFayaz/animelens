import type { ChatInputCommandInteraction } from "discord.js";
import type DiscordClient from "../../classes/client";
import type { Manga } from "../../types/manga";
import { Pagination, type PaginationItem } from "@discordx/pagination";
import { Command } from "../../classes/command";
import { get } from "../../util/funcs";
import mangaInfoEmbed from "../../util/embeds/manga";

export default class MangaTrendingCommand extends Command {
	constructor() {
		super({
			name: "trending",
			description: "Shows trending manga.",
			category: "manga",
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		await interaction.deferReply();

		const data = await get<{ data: Manga[] }>(
			interaction,
			"https://api.jikan.moe/v4/top/manga",
			300,
		);

		if (!data.data) {
			return;
		}

		if (data.data.length === 0) {
			await interaction.editReply("No trending manga found.");
			return;
		}

		const pages: PaginationItem[] = data.data.slice(0, 10).map((m) => ({
			embeds: [mangaInfoEmbed(interaction, m)],
		}));

		const pagination = new Pagination(interaction, pages, {
			selectMenu: {
				disabled: true,
			},
			buttons: {
				backward: {
					label: "Start",
				},
				forward: {
					label: "End",
				},
			},
		});
		await pagination.send();
	}
}
