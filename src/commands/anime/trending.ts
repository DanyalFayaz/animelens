import type { ChatInputCommandInteraction } from "discord.js";
import type DiscordClient from "../../classes/client";
import type { Anime } from "../../types/anime";
import { fetchCached } from "../../util/funcs";
import { Pagination } from "@discordx/pagination";
import { Command } from "../../classes/command";
import infoEmbed from "../../util/embeds/anime";

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
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		await interaction.deferReply();

		let data: { data: Anime[] };
		try {
			data = await fetchCached<{ data: Anime[] }>(
				"https://api.jikan.moe/v4/top/anime",
				5 * 60 * 1000
			);
		} catch (err: any) {
			await interaction.editReply(
				`Error fetching trending anime: ${err.message || err}`
			);
			return;
		}

		if (data.data.length === 0) {
			await interaction.editReply("No trending anime found.");
			return;
		}

		const embeds = data.data
			.slice(0, 10)
			.map(
				(a) => ({ content: null, embeds: [infoEmbed(interaction, a)] } as any)
			);
		const pagination = new Pagination(interaction, embeds);
		await pagination.send();
	}
}
