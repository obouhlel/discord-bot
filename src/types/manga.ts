import type { MediaTitle } from "./media-title";

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

interface MangaDate {
  day: number;
  month: number;
  year: number;
}

interface MangaPublished {
  from: string;
  to: string;
  prop: {
    from: MangaDate;
    to: MangaDate;
    string: string;
  };
}

interface MangaReference {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

interface MangaRelation {
  relation: string;
  entry: MangaReference[];
}

interface MangaExternal {
  name: string;
  url: string;
}

export interface Manga {
  mal_id: number;
  url: string;
  images: MangaImages;
  approved: boolean;
  titles: MediaTitle[];
  type: "Manga";
  chapters: number;
  volumes: number;
  status: string;
  publishing: boolean;
  published: MangaPublished;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string;
  authors: MangaReference[];
  serializations: MangaReference[];
  genres: MangaReference[];
  explicit_genres: MangaReference[];
  themes: MangaReference[];
  demographics: MangaReference[];
  relations: MangaRelation[];
  external: MangaExternal[];
}
