import consola from "consola";
import type DiscordClient from "../classes/client";
import { watch } from "fs";

async function loadModule(file: string, fresh = false) {
	const path = `${process.cwd()}/${file}`;
	const module = await import(fresh ? `${path}?t=${Date.now()}` : path);
	return module.default ? new module.default() : null;
}

async function loadFiles(client: DiscordClient, pattern: string, isEvent = false, fresh = false) {
	const glob = new Bun.Glob(pattern);
	for (const file of glob.scanSync(".")) {
		try {
			const item = await loadModule(file, fresh);
			if (!item?.name) continue;
			
			if (isEvent) {
				client.removeAllListeners(item.name);
				client[item.once ? "once" : "on"](item.name, (...args) => item.execute(client, ...args));
				client.events.set(item.name, item);
			} else {
				// Use composite key when category exists so we can distinguish subcommands
				const key = item.category ? `${item.category}:${item.name}` : item.name;
				client.commands.set(key, item);
			}
		} catch (err) {
			consola.error(err);
		}
	}
}

export async function loadAll(client: DiscordClient, fresh = false) {
	consola.start("Loading events...");
	if (fresh) {
		client.events.clear();
		client.commands.clear();
	}
	await loadFiles(client, "src/events/*.ts", true, fresh);
	consola.start("Loading commands...");
	await loadFiles(client, "src/commands/**/*.ts", false, fresh);
}

export function watchFiles(client: DiscordClient) {
	let timeout: NodeJS.Timeout;
	watch("src", { recursive: true }, (_, filename) => {
		if (!filename?.endsWith(".ts")) return;
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			consola.start("Reloading...");
			loadAll(client, true);
		}, 100);
	});
}
