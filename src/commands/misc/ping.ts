import type { ChatInputCommandInteraction } from "discord.js";
import type DiscordClient from "@classes/client";
import { baseEmbed } from "@util/funcs";
import { Command } from "@classes/command";

export default class PingCommand extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Check the bot's latency.",
			cooldown: 10,
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		const start = Date.now();
		await interaction.deferReply();

		const wsPing = client.ws.ping;
		const apiLatency = Date.now() - start;

		const totalSeconds = Math.floor(process.uptime());
		const h = Math.floor(totalSeconds / 3600)
			.toString()
			.padStart(2, "0");
		const m = Math.floor((totalSeconds % 3600) / 60)
			.toString()
			.padStart(2, "0");
		const s = Math.floor(totalSeconds % 60)
			.toString()
			.padStart(2, "0");

		const embed = baseEmbed({
			title: "🏓 Pong!",
			description: "Latency diagnostics",
			fields: [
				{
					name: "WebSocket",
					value: `\`${wsPing.toFixed(0)}ms\``,
					inline: true,
				},
				{
					name: "API Roundtrip",
					value: `\`${apiLatency}ms\``,
					inline: true,
				},
				{
					name: "Uptime",
					value: `\`${h}:${m}:${s}\``,
					inline: true,
				},
			],
		});

		await interaction.editReply({ embeds: [embed] });
	}
}
