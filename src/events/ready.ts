import type DiscordClient from "@classes/client";
import { ActivityType } from "discord.js";
import { Event } from "@classes/event";
import { app } from "server";
import registerCommands from "@util/register";
import consola from "consola";

export default class ReadyEvent extends Event<"clientReady"> {
	constructor() {
		super({
			name: "clientReady",
			once: true,
		});
	}

	public override async execute(client: DiscordClient): Promise<void> {
		client.user!.setActivity(`/help | by Cored, Inc`, {
			type: ActivityType.Watching,
		});
		consola.success(
			`Logged in as ${client.user!.username} (${client.user!.id})`,
		);
		consola.success(
			`Ready to serve ${client.users.cache.size} user(s) in ${client.guilds.cache.size} servers.`,
		);
		await registerCommands(client, Bun.env.NODE_ENV === "development");

		app.listen(Bun.env.SERVER_PORT, () => {
			consola.success(`Server running on port ${Bun.env.SERVER_PORT}`);
		});
	}
}
