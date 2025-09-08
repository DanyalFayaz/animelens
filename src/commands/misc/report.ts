import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	MessageFlags,
} from "discord.js";
import type DiscordClient from "@classes/client";
import { baseEmbed } from "@util/funcs";
import { Command } from "@classes/command";

export default class ReportCommand extends Command {
	constructor() {
		super({
			name: "report",
			description: "Report a bug or issue",
			category: "bug",
			cooldown: 86400,
			options: [
				{
					name: "issue",
					description: "The issue you want to report",
					type: ApplicationCommandOptionType.String,
					required: true,
				},
				{
					name: "image",
					description: "The image related to the issue (if any)",
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const issue = interaction.options.getString("issue", true);
		const image = interaction.options.getString("image", false);

		const UserReportEmbed = baseEmbed({
			title: "Issue Reported",
			description:
				"Thank you for reporting the issue! Our team will look into it as soon as possible.",
		});

		const DevReportEmbed = baseEmbed({
			title: "Issue Reported",
			description: "A new issue has been reported.",
			fields: [
				{
					name: "User",
					value: `${interaction.user.tag} <@${interaction.user.id}>`,
				},
				{ name: "Issue", value: issue },
				...(image ? [{ name: "Image", value: image }] : []),
			],
			footer: {
				text: `Reported at ${new Date().toLocaleString()} in ${interaction.guild?.name} (${interaction.guildId})`,
			},
		}).toJSON();

		await fetch(Bun.env.SUPPORT_WEBHOOK_URL as string, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ embeds: [DevReportEmbed] }),
		});

		await interaction.reply({
			embeds: [UserReportEmbed],
			flags: [MessageFlags.Ephemeral],
		});
	}
}
