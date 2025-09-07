import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "../../classes/client";
import type { Anime } from "../../types/anime";
import { Pagination } from "@discordx/pagination";
import { Command } from "../../classes/command";
import animeInfoEmbed from "../../util/embeds/anime";

export default class ScheduleCommand extends Command {
	constructor() {
		super({
			name: "schedule",
			description:
				"Get the anime airing schedule for a specific day or the entire week.",
			category: "anime",
			options: [
				{
					name: "day",
					type: ApplicationCommandOptionType.String,
					description: "The day to get the schedule for (e.g. Monday)",
					required: false,
					choices: [
						{ name: "Monday", value: "monday" },
						{ name: "Tuesday", value: "tuesday" },
						{ name: "Wednesday", value: "wednesday" },
						{ name: "Thursday", value: "thursday" },
						{ name: "Friday", value: "friday" },
						{ name: "Saturday", value: "saturday" },
						{ name: "Sunday", value: "sunday" },
					],
				},
				{
					name: "sfw",
					type: ApplicationCommandOptionType.Boolean,
					description: "Whether to include only SFW (Safe For Work) anime.",
					required: false,
				},
			],
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const day = interaction.options.getString("day", false);
		const sfw = interaction.options.getBoolean("sfw", false) ?? false;

		await interaction.deferReply();

		const params = new URLSearchParams();
		if (day) params.set("filter", day);
		if (sfw) params.set("sfw", "true");
		const url = `https://api.jikan.moe/v4/schedules${
			params.toString() ? `?${params.toString()}` : ""
		}`;
		const response = await fetch(url);

		if (!response.ok) {
			await interaction.editReply(
				"Failed to fetch anime schedule. Please try again later.",
			);
			return;
		}

		const data = (await response.json()) as { data: Anime[] };
		const selected = data.data
			.sort(
				(a, b) =>
					(a.rank ?? Number.POSITIVE_INFINITY) -
					(b.rank ?? Number.POSITIVE_INFINITY),
			)
			.slice(0, 10);

		const embeds = selected.map(
			(a) =>
				({ content: null, embeds: [animeInfoEmbed(interaction, a)] }) as any,
		);
		const pagination = new Pagination(interaction, embeds, {
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
