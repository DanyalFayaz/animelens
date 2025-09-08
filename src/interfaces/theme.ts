export interface AnimeTheme {
	id: number;
	sequence: number;
	slug: string;
	type: string;
	anime: {
		id: number;
		name: string;
		media_format: string;
		season: string;
		slug: string;
		synopsis: string;
		year: number;
		images: Image[];
	};
	song: {
		id: number;
		title: string;
		artists: Artist[];
	};
	animethemeentries: {
		id: number;
		episodes: string;
		notes: string | null;
		nsfw: boolean;
		spoiler: boolean;
		version: number | null;
		videos: Video[];
	}[];
}

export interface Image {
	id: number;
	facet: string;
	path: string;
	link: string;
}

export interface Artist {
	id: number;
	name: string;
	slug: string;
	information: string | null;
}

export interface Video {
	id: number;
	basename: string;
	filename: string;
	lyrics: boolean;
	nc: boolean;
	overlay: string;
	path: string;
	resolution: string;
	size: number;
	source: string;
	subbed: boolean;
	uncen: boolean;
	tags: string;
	link: string;
}
