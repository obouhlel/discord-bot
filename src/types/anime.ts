import type { MediaTitle } from "./media-title";

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

interface AnimeTrailer {
  youtube_id: string;
  url: string;
  embed_url: string;
}

interface AnimeProp {
  from: {
    day: number;
    month: number;
    year: number;
  };
  to: {
    day: number;
    year: number;
    month: number;
  };
  string: string;
}

interface AnimeAired {
  from: string;
  to: string;
  prop: AnimeProp;
}

interface AnimeBroadcast {
  day: string;
  time: string;
  timezone: string;
  string: string;
}

interface AnimeEntry {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

interface AnimeRelation {
  relation: string;
  entry: AnimeEntry[];
}

interface AnimeTheme {
  openings: string[];
  endings: string[];
}

interface AnimeExternal {
  name: string;
  url: string;
}

export interface Anime {
  mal_id: number;
  url: string;
  images: AnimeImages;
  trailer: AnimeTrailer;
  approved: boolean;
  titles: MediaTitle[];
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  aired: AnimeAired;
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
  season: string;
  year: number;
  broadcast: AnimeBroadcast;
  producers: AnimeEntry[];
  licensors: AnimeEntry[];
  studios: AnimeEntry[];
  genres: AnimeEntry[];
  explicit_genres: AnimeEntry[];
  themes: AnimeEntry[];
  demographics: AnimeEntry[];
  relations: AnimeRelation[];
  theme: AnimeTheme;
  external: AnimeExternal[];
  streaming: AnimeExternal[];
}
