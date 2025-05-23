interface AnimeImages {
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

interface AnimeInfo {
  mal_id: number;
  url: string;
  images: AnimeImages;
  title: string;
}

export interface AnimeCharacter {
  role: string;
  anime: AnimeInfo;
}

export interface AnimeCharacterResponse {
  data: AnimeCharacter[];
}
