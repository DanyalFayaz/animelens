export interface Question {
	type: "boolean";
	difficulty: "easy" | "medium" | "hard";
	category: string;
	question: string;
	correct_answer: string;
	incorrect_answers: string[];
}
