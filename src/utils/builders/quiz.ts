import type { RedisClient } from "bun";
import type { TextChannel } from "discord.js";
import type { AnimeResponse } from "types/responses/jikan/anime";
import type { MangaResponse } from "types/responses/jikan/manga";
import type { QuizCharacters, QuizData } from "types/quiz";
import type {
  Character,
  CharacterResponse,
} from "types/responses/jikan/characters";
import { QuizManager } from "managers/QuizManager";
import Random from "utils/random";

const API_URL = "https://api.jikan.moe/v4";
const UNKNOWN = "https://cdn.myanimelist.net/images/questionmark_23.gif";
const RANDOM = new Random();

async function requestGet(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
}

async function fetchMediaData(
  id: number,
): Promise<AnimeResponse | MangaResponse | null> {
  const urlMedia = `${API_URL}/anime/${id.toString()}`;
  return (await requestGet(urlMedia)) as AnimeResponse | MangaResponse | null;
}

async function fetchCharacters(id: number): Promise<Character[]> {
  const urlCharacters = `${API_URL}/anime/${id.toString()}/characters`;
  const response = (await requestGet(
    urlCharacters,
  )) as CharacterResponse | null;
  return response?.data ?? [];
}

function selectRandomCharacter(characters: Character[]): Character | null {
  if (characters.length === 0) return null;
  const random = RANDOM.next() % characters.length;
  return characters[random]!;
}

function formatCharactersList(
  characters: Character[],
  excludeId: number,
): QuizCharacters[] {
  return characters
    .map((data) => ({
      id: data.character.mal_id,
      name: data.character.name,
      image: data.character.images.jpg.image_url,
    }))
    .filter((c) => c.id !== excludeId);
}

function extractMediaInfo(media: AnimeResponse | MangaResponse) {
  return {
    titles: media.data.titles,
    url: media.data.url,
    synopsis: media.data.synopsis,
    genres: media.data.genres.map((genre) => genre.name),
    cover: media.data.images.jpg.large_image_url,
  };
}

export async function buildQuizDataManager(
  id: number,
  redis: RedisClient,
  timeouts: Map<string, NodeJS.Timeout>,
  channel: TextChannel,
): Promise<QuizManager | null> {
  let mediaData: AnimeResponse | MangaResponse | null = null;
  do {
    mediaData = await fetchMediaData(id);
  } while (!mediaData);

  const charactersData = await fetchCharacters(id);
  const characters = charactersData.filter(
    (data) => !data.character.images.jpg.image_url.startsWith(UNKNOWN),
  );
  const selectedCharacter = selectRandomCharacter(characters);
  if (!selectedCharacter) return null;

  const characterId = selectedCharacter.character.mal_id;
  const characterInfo = {
    id: characterId,
    name: selectedCharacter.character.name,
    image: selectedCharacter.character.images.jpg.image_url,
  };

  const mediaInfo = extractMediaInfo(mediaData);

  const data: QuizData = {
    character: characterInfo,
    hint: {
      synopsis: mediaInfo.synopsis,
      genres: mediaInfo.genres,
      cover: mediaInfo.cover,
      characters: formatCharactersList(characters, characterId),
    },
    titles: mediaInfo.titles,
    url: mediaInfo.url,
    score: 5,
  };

  return new QuizManager(data, redis, timeouts, channel);
}
