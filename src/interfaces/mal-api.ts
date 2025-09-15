export interface TokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

export interface MalUser {
	id: number;
	name: string;
	birthday: string;
	joined_at: string;
}

export interface ListAnime {
	node: Node;
	list_status: ListStatus;
	detailed?: MALAnime;
}

export interface Node {
	id: number;
	title: string;
	main_picture: Record<"medium" | "large", string>;
}

export interface ListStatus {
	status: "completed" | "watching" | "on_hold" | "dropped" | "plan_to_watch";
	score: number;
	num_episodes_watched: number;
	is_rewatching: boolean;
	updated_at: string;
	finish_date?: string;
	start_date?: string;
}

export interface MALAnime {
	id: number;
	title: string;
	main_picture: Record<"medium" | "large", string>;
	start_date: string;
	alternative_titles: { synonyms: string[]; en: string; ja: string };
	synopsis: string;
	rank?: number;
	popularity: number;
	num_list_users: number;
	num_scoring_users: number;
	media_type: string;
	status: string;
	genres: { id: number; name: string }[];
	num_episodes: number;
	start_season: { year: number; season: string };
	broadcast?: { day_of_the_week: string; start_time: string };
	source: string;
	average_episode_duration?: number;
	rating: string;
	pictures: Record<"medium" | "large", string>[];
	background?: string;
	related_anime: RelatedAnime[];
	related_manga: any[];
	recommendations: { node: Node; num_recommendations: number }[];
	studios: { id: number; name: string }[];
}

export interface RelatedAnime {
	node: Node;
	relation_type:
		| "alternative_version"
		| "character"
		| "other"
		| "side_story"
		| "summary";
	relation_type_formatted:
		| "AlternativeVersion"
		| "Character"
		| "Other"
		| "SideStory"
		| "Summary";
}
