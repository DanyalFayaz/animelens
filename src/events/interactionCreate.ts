import type { Interaction, CacheType } from "discord.js";
import type DiscordClient from "@classes/client";
import { baseEmbed, replyOrFollowUp } from "@util/funcs";
import { Event } from "@classes/event";
import { prisma } from "@util/db";
import consola from "consola";

export default class InteractionCreateEvent extends Event<"interactionCreate"> {
	constructor() {
		super({ name: "interactionCreate", once: false });
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
				if (sub)
					command = client.commands.get(`${interaction.commandName}:${sub}`);
			} catch {}
		}
		if (!command) return;

		const owners = new Set(
			(Bun.env.DISCORD_OWNER_IDS ?? "")
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		);
		const isOwner = owners.has(interaction.user.id);

		if (command.category === "owner" && !isOwner) {
			const NoPermissionEmbed = baseEmbed({
				title: "No permission",
				description: "You do not have permission to use this command.",
			});

			await replyOrFollowUp(interaction)({
				embeds: [NoPermissionEmbed],
				ephemeral: true,
			});
			return;
		}

		try {
			let userRecord = null;
			if (command.authentication) {
				userRecord = await prisma.user.findUnique({
					where: { id: interaction.user.id },
				});

				if (!userRecord) {
					const UnauthenticatedEmbed = baseEmbed({
						title: "Not linked",
						description:
							"You need to link your MyAnimeList account to use this command. Use `/link`.",
					});
					await replyOrFollowUp(interaction)({
						embeds: [UnauthenticatedEmbed],
						ephemeral: true,
					});
					return;
				}

				if (!userRecord.malExpiresAt || userRecord.malExpiresAt < new Date()) {
					const ExpiredEmbed = baseEmbed({
						title: "Session expired",
						description:
							"Your MyAnimeList session has expired. Please use `/link` to relink.",
					});
					await replyOrFollowUp(interaction)({
						embeds: [ExpiredEmbed],
						ephemeral: true,
					});
					return;
				}
			}

			const effectiveCooldown = isOwner ? 0 : (command.cooldown ?? 3);
			if (effectiveCooldown > 0) {
				const now = new Date();
				const key = { userId: interaction.user.id, command: command.name };

				const existing = await prisma.cooldown.findUnique({
					where: { userId_command: key },
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
						description: `You are on cooldown. Please wait ${remaining} more second(s) before reusing \`${command.name}\`.`,
					});
					await replyOrFollowUp(interaction)({
						embeds: [CooldownEmbed],
						ephemeral: true,
					});
					return;
				}

				const expiresAt = new Date(Date.now() + effectiveCooldown * 1000);

				await prisma.cooldown.upsert({
					where: { userId_command: key },
					update: { expiresAt },
					create: { ...key, expiresAt },
				});
			}

			if (command.authentication) {
				await command.execute(client, interaction, userRecord!);
			} else {
				await command.execute(client, interaction);
			}
		} catch (err) {
			consola.error(err);
			try {
				await replyOrFollowUp(interaction)({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			} catch (replyErr) {
				consola.error("Failed to send error reply:", replyErr);
			}
		}
	}
}
