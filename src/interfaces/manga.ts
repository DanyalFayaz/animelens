export interface Manga {
	mal_id: number;
	url: string;
	images: Images;
	approved: boolean;
	titles: {type:string,title:string}[];
	title: string;
	title_english: string;
	title_japanese: string;
	title_synonyms: string[];
	type: string;
	chapters?: number;
	volumes?: number;
	status: string;
	publishing: boolean;
	published: {
		from: string;
		to?: string;
		prop: { from: Prop; to?: Prop };
		string: string;
	};
	score: number;
	scored: number;
	scored_by: number;
	rank: number;
	popularity: number;
	members: number;
	favorites: number;
	synopsis: string;
	background: string;
	authors: Entity[];
	serializations: Entity[];
	genres: Entity[];
	explicit_genres: Entity[];
	themes: Entity[];
	demographics: Entity[];
}

export interface Prop {
	day: number;
	month: number;
	year: number;
}

export interface Entity {
	mal_id: number;
	type: string;
	name: string;
	url: string;
}

type Images = Record<"jpg" | "webp", Extension>;

export interface Extension {
	image_url: string;
	small_image_url: string;
	large_image_url: string;
}