import type DiscordClient from "@classes/client";
import { Command } from "@classes/command";
import { emojis, WEBSITE_URL } from "@util/constants";
import { baseEmbed } from "@util/funcs";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
} from "discord.js";

export default class LinkCommand extends Command {
	constructor() {
		super({
			name: "link",
			description: "Link your Discord account with your MyAnimeList account.",
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel("Link MyAnimeList")
				.setEmoji(emojis.myanimelist)
				.setURL(`${Bun.env.SERVER_DOMAIN}/mal/link/${interaction.user.id}`)
		);

		const LinkEmbed = baseEmbed({
			title: "Link Your MyAnimeList Account",
			description: "Click the button below to link your MyAnimeList account.",
		});

		await interaction.reply({ embeds: [LinkEmbed], components: [row] });
	}
}
