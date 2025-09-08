import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "@classes/client";
import { baseEmbed, capitalize } from "@util/funcs";
import { Command } from "@classes/command";
import { emojis } from "@util/constants";

export default class HelpCommand extends Command {
	constructor() {
		super({
			name: "help",
			description: "Shows what I can do and how to use me.",
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const visibleCommands = Array.from(client.commands.values()).filter(
			(cmd) => cmd.category !== "admin" && cmd.category !== "owner",
		);

		const grouped = new Map<string, Command[]>();
		for (const cmd of visibleCommands) {
			const cat = cmd.category || "";
			if (!grouped.has(cat)) grouped.set(cat, []);
			grouped.get(cat)!.push(cmd);
		}

		const sortedCategories = Array.from(grouped.keys()).sort((a, b) =>
			a.localeCompare(b),
		);
		for (const cat of sortedCategories) {
			grouped.get(cat)!.sort((a, b) => a.name.localeCompare(b.name));
		}

		const truncate = (text: string, max: number) =>
			text.length > max ? text.slice(0, max - 1) + "…" : text;

		const fields: { name: string; value: string; inline?: boolean }[] = [];
		for (const cat of sortedCategories) {
			const cmds = grouped.get(cat)!;
			const lines = cmds.map(
				(c) =>
					`• \`/${cat.length > 0 ? cat + " " : ""}${c.name}\` — ${truncate(c.description, 70)}`,
			);
			let value = lines.join("\n");
			if (value.length > 1024) {
				let chunk = "";
				let part = 1;
				for (const line of lines) {
					if (chunk.length + line.length + 1 > 1024) {
						fields.push({
							name: `${capitalize(cat)} (part ${part})`,
							value: chunk,
							inline: false,
						});
						chunk = line;
						part++;
					} else {
						chunk += (chunk ? "\n" : "") + line;
					}
				}
				if (chunk)
					fields.push({
						name: `${capitalize(cat)} (part ${part})`,
						value: chunk,
						inline: false,
					});
			} else {
				fields.push({ name: capitalize(cat), value, inline: false });
			}
		}

		const HelpEmbed = baseEmbed({
			title: `✨ ${client.user!.username} Commands & Info`,
			description:
				"Hi! I'm your anime assistant here to provide you with anime info, quotes, characters & more.\nType / and start typing a command name to see autocomplete.\nAdd me to more servers & share the love!",
			fields:
				fields.length > 0
					? fields
					: [{ name: "No commands yet", value: "Looks empty..." }],
			thumbnail: { url: client.user!.displayAvatarURL() + "?size=1024" },
		});

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel("View on Github")
				.setEmoji(emojis.github)
				.setStyle(ButtonStyle.Link)
				.setURL(Bun.env.GITHUB_REPO_URL!),
		);

		await interaction.reply({ embeds: [HelpEmbed], components: [row] });
	}
}
