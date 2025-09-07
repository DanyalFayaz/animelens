import type {
	ChatInputCommandInteraction,
	GuildTextBasedChannel,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	type ButtonInteraction,
	type Collection,
} from "discord.js";
import type DiscordClient from "../../classes/client";
import { Command } from "../../classes/command";
import type { Question } from "../../types/quiz";
import { baseEmbed, cleanText } from "../../util/funcs";

export default class QuizCommand extends Command {
	constructor() {
		super({
			name: "quiz",
			description: "Starts a random anime true or false quiz.",
			category: "anime",
			options: [
				{
					name: "difficulty",
					description: "The difficulty of the quiz.",
					type: ApplicationCommandOptionType.String,
					required: false,
					choices: [
						{ name: "easy", value: "easy" },
						{ name: "medium", value: "medium" },
						{ name: "hard", value: "hard" },
					],
				},
			],
		});
	}

	override async execute(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		const difficulty = interaction.options.getString("difficulty") || "easy";
		await interaction.deferReply();

		const response = await fetch(
			`https://opentdb.com/api.php?amount=1&category=31&type=boolean&difficulty=${difficulty}`
		);

		if (!response.ok) {
			await interaction.editReply({
				content: `Failed to fetch quiz question. Please try again later.`,
			});
			return;
		}

		const data = (await response.json()) as { results: Question[] };
		if (!data.results || data.results.length === 0) {
			await interaction.editReply({
				content: `No quiz questions available. Please try again later.`,
			});
			return;
		}
		const question = data.results[0]!;

		const difficultyBadges: Record<string, string> = {
			easy: "🟢 Easy",
			medium: "🟡 Medium",
			hard: "🔴 Hard",
		};

		const cleanedQuestion = cleanText(question.question);

		const QuestionEmbed = baseEmbed({
			title: "🎌 Anime True / False",
			description: `**Difficulty:** ${
				difficultyBadges[difficulty]
			}\n**Question:** ${cleanedQuestion}\n\nYou have 15 seconds to choose the correct answer below.`,
		});

		const TRUE_ID = `quiz_true_${interaction.id}`;
		const FALSE_ID = `quiz_false_${interaction.id}`;
		const trueBtn = new ButtonBuilder()
			.setCustomId(TRUE_ID)
			.setLabel("True")
			.setStyle(ButtonStyle.Success);
		const falseBtn = new ButtonBuilder()
			.setCustomId(FALSE_ID)
			.setLabel("False")
			.setStyle(ButtonStyle.Danger);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			trueBtn,
			falseBtn
		);

		await interaction.editReply({
			content: "",
			embeds: [QuestionEmbed],
			components: [row],
		});

		const message = await interaction.fetchReply();
		const collector = (message as any).createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 15_000,
			max: 1,
			filter: (i: any) => i.user.id === interaction.user.id,
		});

		collector.on("collect", async (btn: ButtonInteraction) => {
			const picked = btn.customId === TRUE_ID ? "true" : "false";
			const isCorrect = picked === question.correct_answer.toLowerCase();
			await btn.deferUpdate();

			row.components.forEach((c) => {
				c.setDisabled(true);
				if (btn.customId === TRUE_ID && c === trueBtn) {
					c.setStyle(isCorrect ? ButtonStyle.Success : ButtonStyle.Secondary);
				} else if (btn.customId === FALSE_ID && c === falseBtn) {
					c.setStyle(isCorrect ? ButtonStyle.Success : ButtonStyle.Secondary);
				}
			});

			QuestionEmbed.setFooter({
				text: `${isCorrect ? "✅ Correct" : "❌ Wrong"} • Answer: ${
					question.correct_answer
				}`,
			});
			await interaction.editReply({
				embeds: [QuestionEmbed],
				components: [row],
			});
		});

		collector.on(
			"end",
			async (
				collected: Collection<string, ButtonInteraction>,
				reason: string
			) => {
				if (reason === "time" && collected.size === 0) {
					row.components.forEach((c) => c.setDisabled(true));
					QuestionEmbed.setFooter({
						text: `⌛ Time's up • Answer: ${question.correct_answer}`,
					});
					await interaction.editReply({
						embeds: [QuestionEmbed],
						components: [row],
					});
				}
			}
		);
	}
}
