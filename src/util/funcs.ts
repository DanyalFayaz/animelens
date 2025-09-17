import {
	ApplicationCommandOptionType,
	Colors,
	CommandInteraction,
	EmbedBuilder,
	type EmbedData,
	type InteractionReplyOptions,
} from "discord.js";
import { client } from "../";
import { WEBSITE_URL } from "@util/constants";
import characterInfoEmbed from "./embeds/character";
import animeInfoEmbed from "./embeds/anime";
import mangaInfoEmbed from "./embeds/manga";
import consola from "consola";
import type { Command } from "@classes/command";

/** Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Creates a base embed with default properties
 * @param data The embed data to use
 * @returns The embed
 */
export function baseEmbed(data: EmbedData): EmbedBuilder {
	return new EmbedBuilder({
		color: Colors.Purple,
		timestamp: new Date().toISOString(),
		footer: {
			text: `AnimeLens • ${WEBSITE_URL.replace(/^https?:\/\//, "")}`,
			iconURL: client.user!.displayAvatarURL() + "?size=1024",
		},
		...data,
	});
}

/** Formats the "about" section of a character into a readable string
 * @param about The raw about string from the API
 * @returns The formatted about string
 */
export function formatCharAbout(about: string): string {
	const lines = about.split(/\r?\n/).filter((l) => l.trim().length > 0);
	const output: string[] = [];

	for (const rawLine of lines) {
		const line = rawLine.trim();

		const firstColon = line.indexOf(":");
		let isKeyValue = false;
		let key = "";
		let value = "";
		if (firstColon > 0) {
			key = line.slice(0, firstColon).trim();
			value = line.slice(firstColon + 1).trim();
			const wordCount = key.split(/\s+/).filter(Boolean).length;
			const hasPeriodBeforeColon = key.includes(".");
			if (
				key.length <= 40 &&
				wordCount <= 7 &&
				!/\)\s*$/.test(key) &&
				!hasPeriodBeforeColon &&
				/[A-Za-z0-9]/.test(key) &&
				value.length > 0
			) {
				isKeyValue = true;
			}
		}

		if (isKeyValue) {
			const sanitizedValue = value.replace(/`/g, "\u200b`") || "N/A";
			output.push(`**${key}:** \`${sanitizedValue}\``);
		} else {
			output.push(line);
		}
	}

	return output.join("\n");
}

/** Cleans up common HTML entities in a string
 * @param text The text to clean
 * @returns The cleaned text
 */
export function cleanText(text: string): string {
	return text
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&amp;/g, "&")
		.replace(/&eacute;/g, "é")
		.replace(/&ldquo;|&rdquo;/g, '"')
		.replace(/&rsquo;/g, "'")
		.replace(/&ouml;/g, "ö")
		.replace(/&hellip;/g, "…");
}

let cache: { url: string; data: unknown; expiry: number }[] = [];

/** Simple in-memory fetch cache
 * Avoids repeated requests to the same URL.
 * @param url The full request URL (including query string)
 * @param expirySeconds The number of seconds after which the cached data expires
 * @returns The fetched JSON data or null on error
 */
export async function get<T>(
	interaction: CommandInteraction,
	url: string,
	expirySeconds: number,
	headers?: Record<string, string>,
): Promise<T> {
	const now = Date.now();
	cache = cache.filter((c) => c.expiry > now);
	const existing = cache.find((c) => c.url === url && now < c.expiry);

	if (existing) {
		return existing.data as T;
	}

	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			const body = await response.text().catch(() => "");
			consola.error(
				`HTTP ${response.status} ${response.statusText} - ${body?.slice(0, 200)}`,
			);
		}
		const data = (await response.json()) as T;
		cache.push({ url, data, expiry: now + expirySeconds * 1000 });

		return data;
	} catch (error) {
		consola.error(
			`Failed to fetch data from ${url}: ${(error as Error).message}`,
		);
		await replyOrFollowUp(interaction)({
			content: `Error fetching data. Please try again later.`,
			flags: ["Ephemeral"],
		});
		return { data: null } as unknown as T;
	}
}

/** Chooses the correct embed function based on type
 * @param type The type of content ("anime", "manga", or "characters")
 * @returns The corresponding embed function
 */
export function chooseEmbed(type: string) {
	switch (type) {
		case "manga":
			return mangaInfoEmbed;
		case "characters":
			return characterInfoEmbed;
		default:
			return animeInfoEmbed;
	}
}

/** Chooses whether to reply or follow up to an interaction
 * @param interaction The command interaction
 * @returns The appropriate reply or followUp function
 */
export function replyOrFollowUp(interaction: CommandInteraction) {
	if (interaction.replied || interaction.deferred) {
		return interaction.followUp.bind(interaction);
	}

	return interaction.reply.bind(interaction);
}

interface UpdateParams {
	url: string;
	name: string;
	json: unknown[];
	authHeader: string;
}

/** Registers or prunes slash commands with discord bot lists
 * @param options The update parameters
 */
export async function updateCommands(options: UpdateParams) {
	try {
		const response = await fetch(options.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: options.authHeader,
			},
			body: JSON.stringify(options.json),
		});

		if (!response.ok) {
			const errorText = await response.text();
			consola.error(
				`Failed to update commands on ${options.name}: ${response.status} ${response.statusText} - ${errorText}`,
			);
		} else {
			consola.success(`Successfully updated commands on ${options.name}`);
		}
	} catch (err) {
		consola.error(`Error while updating commands on ${options.name}`, err);
	}
}

/** Dumps all registered commands
 * @returns The commands in JSON format
 */
export async function dumpCommands(view: boolean = false) {
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
		...rootCommands.map((c) => (view ? c.toViewJSON() : c.toJSON())),
		...Array.from(grouped.entries()).map(([category, cmds]) => ({
			name: category,
			description: `${capitalize(category)} commands`,
			options: cmds.map((sub) => ({
				...(view ? sub.toViewJSON() : sub.toJSON()),
				type: ApplicationCommandOptionType.Subcommand,
			})),
		})),
	];

	return commandsJSON;
}


type Cat = { id: string; name: string; commands: Command[]; count: number };

/** Extracts the categories from a list of commands
 * @param commands The list of commands
 * @returns The unique categories
 */
export const getCategories = (
	commands: Command[],
	includeUncategorized = true,
): Cat[] => {
	const cmdGroups = commands.filter(
		(c) => !c.category && !c.cooldown && c.options,
	);
	const allCommands = [
		...commands.filter((c) => c.category || c.cooldown),
		...cmdGroups.map((c) => c.options as unknown as Command[]).flat(),
	];
	const groups = allCommands.reduce(
		(m, c) => {
			const k = (c.category && String(c.category).trim()) || "Utilities";
			(m[k] ||= []).push(c);
			return m;
		},
		{} as Record<string, Command[]>,
	);

	return Object.entries(groups)
		.filter(([k]) => k !== "Utilities" || includeUncategorized)
		.map(([k, cmds]) => ({
			id: k
				.toLowerCase()
				.replace(/[^\w]+/g, "-")
				.replace(/^-+|-+$/g, ""),
			name: capitalize(k),
			commands: cmds,
			count: cmds.length,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
};
