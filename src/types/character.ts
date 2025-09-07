export interface Character {
  mal_id: number
  url: string
  images: Images
  name: string
  name_kanji: string
  nicknames: string[]
  favorites: number
  about: string
}

export interface Extension {
	image_url: string;
	small_image_url: string;
	large_image_url: string;
}

type Images = Record<"jpg" | "webp", Extension>;
