import { client } from "index";

const commands = Array.from(client.commands.values()).filter(
	(cmd) => cmd.category !== "owner",
);

console.dir(
	commands.map((c) => c.toJSON()),
	{ depth: null },
);
