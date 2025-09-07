import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Command } from "./command";
import { Event } from "./event";

export default class DiscordClient extends Client {
	commands = new Collection<string, Command>();
	events = new Collection<string, Event>();

	constructor() {
		super({
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
		});
	}
}
