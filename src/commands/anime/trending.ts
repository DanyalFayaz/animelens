import type { ChatInputCommandInteraction } from "discord.js";
import type DiscordClient from "../../classes/client";
import type { Anime } from "../../types/anime";
import { Pagination, type PaginationItem } from "@discordx/pagination";
import { Command } from "../../classes/command";
import animeInfoEmbed from "../../util/embeds/anime";
import { get } from "../../util/funcs";

export default class TrendingCommand extends Command {
	constructor() {
		super({
			name: "trending",
			description: "Shows trending anime.",
			category: "anime",
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		await interaction.deferReply();

		let data: { data: Anime[] };
		try {
			data = await get<{ data: Anime[] }>(
				"https://api.jikan.moe/v4/top/anime",
				300,
			);
		} catch (err: any) {
			await interaction.editReply(
				`Error fetching trending anime: ${err.message || err}`,
			);
			return;
		}

		if (data.data.length === 0) {
			await interaction.editReply("No trending anime found.");
			return;
		}

		const pages: PaginationItem[] = data.data.slice(0, 10).map((a) => ({
			embeds: [animeInfoEmbed(interaction, a)],
		}));

		const pagination = new Pagination(interaction, pages);
		await pagination.send();
	}
}
