import type DiscordClient from "@classes/client";
import { Command } from "@classes/command";
import type { User } from "@util/db/generated/prisma";
import { baseEmbed } from "@util/funcs";
import type { ChatInputCommandInteraction } from "discord.js";

export default class StatsCommand extends Command {
	constructor() {
		super({
			name: "stats",
			category: "owner",
			description: "Get bot statistics",
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
		user?: User,
	): Promise<void> {
		const guildCount = client.guilds.cache.size;
		const userCount = client.users.cache.size;
		const shardCount = client.shard?.count ?? 1;
		const uptime = process.uptime();
		const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

		const StatsEmbed = baseEmbed({
			title: "Bot Statistics",
			fields: [
				{
					name: "🌐 Guilds",
					value: guildCount.toLocaleString("en-US"),
					inline: true,
				},
				{
					name: "👥 Users",
					value: userCount.toLocaleString("en-US"),
					inline: true,
				},
				{ name: "🛡️ Shards", value: shardCount.toString(), inline: true },
				{
					name: "⏱️ Uptime",
					value: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
					inline: true,
				},
				{
					name: "💾 Memory Usage",
					value: `${memoryUsage.toFixed(2)} MB`,
					inline: true,
				},
			],
		});

        await interaction.reply({ embeds: [StatsEmbed] });
	}
}
