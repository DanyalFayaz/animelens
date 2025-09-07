import { Colors, EmbedBuilder, type EmbedData } from "discord.js";
import { client } from "../";

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
			iconURL: client.user!.displayAvatarURL(),
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

// ---- Simple in-memory fetch cache (TTL) ----
interface CacheEntry<T> { value: T; expires: number; }
const _cache = new Map<string, CacheEntry<unknown>>();

/** Fetch JSON with basic in-process caching for low-churn endpoints.
 * @param url The full request URL (including query string)
 * @param ttlMs Time to live in milliseconds (default 5 minutes)
 */
export async function fetchCached<T = unknown>(url: string, ttlMs = 5 * 60 * 1000): Promise<T> {
	const now = Date.now();
	const existing = _cache.get(url);
	if (existing && existing.expires > now) {
		return existing.value as T;
	}
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Request failed ${res.status} ${res.statusText}`);
	const json = (await res.json()) as T;
	_cache.set(url, { value: json, expires: now + ttlMs });
	return json;
}

export function clearCache(pattern?: RegExp) {
	if (!pattern) return _cache.clear();
	for (const key of _cache.keys()) if (pattern.test(key)) _cache.delete(key);
}
