import { baseEmbed } from "@util/funcs";
import { Colors } from "discord.js";

export default function errorEmbed(
	title: string,
	description?: string,
	error?: Error,
) {
	return baseEmbed({
		color: Colors.Red,
		title: `❌ ${title}`,
		description: `${description ? description + "\n" : ""}${error ? `\`\`\`${error.message}\`\`\`` : ""}`,
	});
}
