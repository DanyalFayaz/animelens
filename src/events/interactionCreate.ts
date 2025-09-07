import type { Interaction, CacheType } from "discord.js";
import type DiscordClient from "../classes/client";
import { Event } from "../classes/event";
import consola from "consola";

export default class InteractionCreateEvent extends Event<"interactionCreate"> {
	constructor() {
		super({
			name: "interactionCreate",
			once: false,
		});
	}

	public override async execute(
		client: DiscordClient,
		interaction: Interaction<CacheType>
	): Promise<void> {
		if (!interaction.isChatInputCommand()) return;

		let command = client.commands.get(interaction.commandName);
		if (!command) {
			try {
				const sub = interaction.options.getSubcommand(false);
				if (sub) {
					command = client.commands.get(`${interaction.commandName}:${sub}`);
				}
			} catch {/* ignore */}
		}
		if (!command) return; 

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
