import type { Command } from "../classes/command";
import type DiscordClient from "../classes/client";
import { REST, Routes, ApplicationCommandOptionType } from "discord.js";
import { capitalize } from "./funcs";
import consola from "consola";

const rest = new REST({ version: "10" }).setToken(
	Bun.env.DISCORD_CLIENT_TOKEN as string
);

export default async function registerCommands(
	client: DiscordClient,
	dev = false,
	prune = true
) {
	// Build grouped structure: category -> subcommands
	const grouped = new Map<string, Command[]>();
	const rootCommands: Command[] = [];

	for (const cmd of client.commands.values()) {
		if (cmd.category) {
			if (!grouped.has(cmd.category)) grouped.set(cmd.category, []);
			grouped.get(cmd.category)!.push(cmd);
		} else {
			rootCommands.push(cmd);
		}
	}

	const commandsJSON = [
		...rootCommands.map((c) => c.toJSON()),
		...Array.from(grouped.entries()).map(([category, cmds]) => ({
			name: category,
			description: `${capitalize(category)} commands`,
			options: cmds.map((sub) => ({
				...sub.toJSON(),
				type: ApplicationCommandOptionType.Subcommand,
			})),
		})),
	];

	try {
		const response = await fetch(`https://discordbotlist.com/api/v1/bots/${client.user!.id}/commands`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bot ${Bun.env.DB_LIST_TOKEN}`,
			},
			body: JSON.stringify(commandsJSON),
		});

		if (!response.ok) {
			const errorText = await response.text();
			consola.error(`Failed to update commands on Discord Bot List: ${response.status} ${response.statusText} - ${errorText}`);
		} else {
			consola.success("Successfully updated commands on Discord Bot List");
		}
	} catch (error) {
		consola.error("Error while updating commands on Discord Bot List", error);
	}

	const newTopLevelNames = commandsJSON.map((c) => c.name);
	const appId = client.user!.id;

	const guildId = Bun.env.DISCORD_GUILD_ID as string | undefined;

	try {
		if (prune) {
			if (!dev) {
				const existing = (await rest.get(
					Routes.applicationCommands(appId)
				)) as any[];
				const stale = existing.filter(
					(c) => !newTopLevelNames.includes(c.name)
				);
				for (const cmd of stale) {
					await rest.delete(Routes.applicationCommand(appId, cmd.id));
					consola.info(`Pruned stale global command: ${cmd.name}`);
				}
			} else if (guildId) {
				const existing = (await rest.get(
					Routes.applicationGuildCommands(appId, guildId)
				)) as any[];
				const stale = existing.filter(
					(c) => !newTopLevelNames.includes(c.name)
				);
				for (const cmd of stale) {
					await rest.delete(
						Routes.applicationGuildCommand(appId, guildId, cmd.id)
					);
					consola.info(`Pruned stale guild command: ${cmd.name}`);
				}
			}
		}

		if (!dev) {
			await rest.put(Routes.applicationCommands(appId), {
				body: commandsJSON,
			});
			consola.success("Registered commands globally (with pruning)");
		} else {
			await rest.put(
				Routes.applicationGuildCommands(appId, guildId as string),
				{ body: commandsJSON }
			);
			consola.success("Registered commands locally (with pruning)");
		}
	} catch (err) {
		consola.error("Failed to register/prune commands", err);
		throw err;
	}
}

export async function registerCommand(client: DiscordClient, command: Command) {
	const rest = new REST({ version: "10" }).setToken(Bun.env.DISCORD_CLIENT_TOKEN!);
	const GUILD_ID = Bun.env.DISCORD_GUILD_ID!;

	await rest.put(Routes.applicationGuildCommands(client.user!.id, GUILD_ID), {
		body: [command.toJSON()],
	});

	consola.success(`Registered command: ${command.name}`);
}
