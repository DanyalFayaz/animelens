import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
} from "discord.js";
import type DiscordClient from "@classes/client";
import { Command } from "@classes/command";
import { baseEmbed } from "@util/funcs";

export default class InviteCommand extends Command {
	constructor() {
		super({
			name: "invite",
			description: "Get the bot invite link",
			category: "misc",
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const InviteEmbed = baseEmbed({
			title: "Invite Me!",
			description: `Use the buttons below to invite me to your server or join the support server!`,
		});

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel("Invite")
				.setURL(
					`https://discord.com/oauth2/authorize?client_id=1414336987984298035`,
				),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel("Support Server")
				.setURL(Bun.env.DISCORD_SUPPORT_SERVER as string)
				.setDisabled(true),
		);

		await interaction.reply({ embeds: [InviteEmbed], components: [row] });
	}
}
