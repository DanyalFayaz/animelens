export interface Producer {
	mal_id: number;
	url: string;
	titles: { type: string; title: string }[];
	images: Images;
	favorites: number;
	established?: string;
	about?: string;
	count: number;
}

type Images = Record<"jpg", Extension>;

export interface Extension {
	image_url: string;
	small_image_url: string;
	large_image_url: string;
}
