import {
	Colors,
	CommandInteraction,
	EmbedBuilder,
	type EmbedData,
} from "discord.js";
import { client } from "../";
import consola from "consola";

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
			text: "Made with ❤️ by Cored, Inc",
			iconURL: client.user!.displayAvatarURL()+"?size=1024",
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
): Promise<T> {
	const now = Date.now();
	cache = cache.filter((c) => c.expiry > now);
	const existing = cache.find((c) => c.url === url && now < c.expiry);

	if (existing) {
		return existing.data as T;
	}

	try {
		const response = await fetch(url);
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
		if (interaction.replied || interaction.deferred) {
			await interaction.editReply(
				`Error fetching data. Please try again later.`,
			);
		} else {
			await interaction.reply(`Error fetching data. Please try again later.`);
		}
		return { data: null } as unknown as T;
	}
}
