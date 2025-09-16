import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "@classes/client";
import { Command } from "@classes/command";
import { baseEmbed } from "@util/funcs";
import { WEBSITE_URL, INVITE_URL, VOTE_URLS, emojis } from "@util/constants";

export default class InviteCommand extends Command {
	constructor() {
		super({
			name: "invite",
			description: "Get the bot invite link",
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const InviteEmbed = baseEmbed({
			title: "Invite AnimeLens",
			description: `Thanks for your interest! Use the buttons below to:\n• Invite the bot\n• Visit the website\n• Vote & support\n\n🌐 Website: [Here](${WEBSITE_URL})`,
		});

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel("Invite")
				.setEmoji(emojis.discord)
				.setURL(INVITE_URL),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel("Website")
				.setEmoji(emojis.discord)
				.setURL(WEBSITE_URL),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel("Vote")
				.setEmoji(emojis.top_gg)
				.setURL(VOTE_URLS.topgg),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel("Support Server")
				.setURL((Bun.env.DISCORD_SUPPORT_SERVER as string) || WEBSITE_URL)
				.setEmoji(emojis.discord)
				.setDisabled(!Bun.env.DISCORD_SUPPORT_SERVER),
		);

		await interaction.reply({ embeds: [InviteEmbed], components: [row] });
	}
}
