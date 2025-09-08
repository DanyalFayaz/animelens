import type { ChatInputCommandInteraction, ApplicationCommandOption } from "discord.js";
import type DiscordClient from "./client";
import type { User } from "@util/db/generated/prisma";

export interface CommandOptions {
	name: string;
	description: string;
	cooldown?: number;
	category?: string;
	authentication?: boolean;
	options?: ApplicationCommandOption[];
}

export abstract class Command {
	public name: string;
	public description: string;
	public cooldown?: number;
	public category?: string;
	public authentication?: boolean;
	public options?: ApplicationCommandOption[];

	constructor(options: CommandOptions) {
		this.name = options.name;
		this.description = options.description;
		this.cooldown = options.cooldown;
		this.category = options.category;
		this.authentication = options.authentication;
		this.options = options.options;
	}

	abstract execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
		user?: User
	): Promise<void>;

	toJSON() {
		return {
			name: this.name,
			description: this.description,
			options: this.options ?? [],
		};
	}
}
