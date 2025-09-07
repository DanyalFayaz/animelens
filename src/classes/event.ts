import type { ClientEvents } from "discord.js";
import type DiscordClient from "./client";

export interface EventOptions<K extends keyof ClientEvents> {
	name: K;
	once?: boolean;
}

export abstract class Event<K extends keyof ClientEvents = keyof ClientEvents> {
	public name: K;
	public once: boolean;

	constructor(options: EventOptions<K>) {
		this.name = options.name;
		this.once = options.once ?? false;
	}

	public abstract execute(
		client: DiscordClient,
		...args: ClientEvents[K]
	): Promise<void> | void;
}