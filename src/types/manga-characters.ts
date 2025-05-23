interface MangaImages {
  jpg: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
  webp: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
}

interface Manga {
  mal_id: number;
  url: string;
  images: MangaImages;
  title: string;
}

export interface MangaCharacter {
  role: string;
  manga: Manga;
}

export interface MangaCharactersResponse {
  data: MangaCharacter[];
}
