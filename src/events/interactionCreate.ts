import { type Interaction, type CacheType, MessageFlags } from "discord.js";
import type DiscordClient from "@classes/client";
import { Event } from "@classes/event";
import { prisma } from "@util/db";
import consola from "consola";
import { baseEmbed } from "@util/funcs";

export default class InteractionCreateEvent extends Event<"interactionCreate"> {
	constructor() {
		super({
			name: "interactionCreate",
			once: false,
		});
	}

	public override async execute(
		client: DiscordClient,
		interaction: Interaction<CacheType>,
	): Promise<void> {
		if (!interaction.isChatInputCommand()) return;

		let command = client.commands.get(interaction.commandName);
		if (!command) {
			try {
				const sub = interaction.options.getSubcommand(false);
				if (sub) {
					command = client.commands.get(`${interaction.commandName}:${sub}`);
				}
			} catch {
				/* ignore */
			}
		}

		if (!command) return;
		
		const now = new Date();
		const owners = Bun.env.DISCORD_OWNER_IDS?.split(",");

		if (!command.cooldown) command.cooldown = 3;
		if (owners?.includes(interaction.user.id)) command.cooldown = 0;

		const options = {
			userId: interaction.user.id,
			command: command.name,
		};
		const existing = await prisma.cooldown.findUnique({
			where: {
				userId_command: options,
			},
		});

		if (existing && existing.expiresAt > now) {
			const remaining = Math.ceil(
				(existing.expiresAt.getTime() - now.getTime()) / 1000,
			);
			const CooldownEmbed = baseEmbed({
				author: {
					name: interaction.user.username,
					iconURL: interaction.user.displayAvatarURL(),
				},
				description: `You are on cooldown. Please wait ${remaining} more second(s) before reusing the \`${command.name}\` command.`,
			});
			await interaction.reply({
				embeds: [CooldownEmbed],
				flags: [MessageFlags.Ephemeral],
			});
			return;
		}

		const expiresAt = new Date(Date.now() + command.cooldown * 1000);
		await prisma.cooldown.upsert({
			where: {
				userId_command: options,
			},
			update: { expiresAt },
			create: {
				...options,
				expiresAt,
			},
		});

		try {
			await command.execute(client, interaction);
		} catch (error) {
			consola.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			} else {
				await interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			}
		}
	}
}
