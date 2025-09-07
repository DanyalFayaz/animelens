import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	EmbedBuilder,
} from "discord.js";
import { Pagination, type PaginationItem } from "@discordx/pagination";
import type DiscordClient from "@classes/client";
import type { Character } from "@interfaces/character";
import type { Manga } from "@interfaces/manga";
import type { Anime } from "@interfaces/anime";
import { chooseEmbed, get } from "@util/funcs";
import { Command } from "@classes/command";

export default class TrendingCommand extends Command {
	constructor() {
		super({
			name: "trending",
			description: "Shows trending anime, manga or characters.",
			options: [
				{
					name: "type",
					description: "The type of trending content to show.",
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: [
						{ name: "Anime", value: "anime" },
						{ name: "Manga", value: "manga" },
						{ name: "Characters", value: "characters" },
					],
				},
			],
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const query = interaction.options.getString("type", true);
		await interaction.deferReply();

		const data = await get<{ data: Anime[] | Manga[] | Character[] }>(
			interaction,
			`https://api.jikan.moe/v4/top/${query}`,
			300,
		);

		if (!data.data) return;

		const pages: PaginationItem[] = data.data.slice(0, 10).map((a) => ({
			embeds: [chooseEmbed(query)(interaction, a as any)],
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
