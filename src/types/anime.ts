export interface Anime {
	mal_id: number;
	url: string;
	images: Images;
	trailer: Trailer;
	approved: boolean;
	titles: { type: string; title: string }[];
	title: string;
	title_english?: string;
	title_japanese: string;
	title_synonyms: string[];
	type: string;
	source: string;
	episodes: number;
	status: string;
	airing: boolean;
	aired: {
		from: string;
		to: string | null;
		prop: Record<
			"from" | "to",
			{ day: number | null; month: number | null; year: number | null }
		>;
		string: string;
	};
	duration: string;
	rating: string;
	score: number;
	scored_by: number;
	rank: number;
	popularity: number;
	members: number;
	favorites: number;
	synopsis: string;
	background: string;
	season?: string;
	year?: number;
	broadcast: Record<string, string>;
	producers: Entity[];
	licensors: Entity[];
	studios: Entity[];
	genres: Entity[];
	explicit_genres: string[];
	themes: Entity[];
	demographics: Entity[];
}

export interface Extension {
	image_url: string;
	small_image_url: string;
	large_image_url: string;
}

export interface Trailer {
	youtube_id: string;
	url: string;
	embed_url: string;
	images: Images;
}

export interface Entity {
	mal_id: number;
	type: string;
	name: string;
	url: string;
}

type Images = Record<"jpg" | "webp", Extension>;
