import type { ChatInputCommandInteraction, ApplicationCommandOption } from "discord.js";
import type DiscordClient from "./client";

export interface CommandOptions {
	name: string;
	description: string;
	category?: string;
	options?: ApplicationCommandOption[];
}

export abstract class Command {
	public name: string;
	public description: string;
	public category?: string;
	public options?: ApplicationCommandOption[];

	constructor(options: CommandOptions) {
		this.name = options.name;
		this.description = options.description;
		this.category = options.category;
		this.options = options.options;
	}

	abstract execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction
	): Promise<void>;

	toJSON() {
		return {
			name: this.name,
			description: this.description,
			options: this.options ?? [],
		};
	}
}
