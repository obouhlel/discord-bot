import axios from "axios";
import type { RedisClient } from "bun";
import type { TextChannel } from "discord.js";
import type { AnimeResponse } from "types/responses/jikan/anime";
import type { MangaResponse } from "types/responses/jikan/manga";
import type { QuizCharacters, QuizData, QuizType } from "types/quiz";
import type {
  Character,
  CharacterResponse,
} from "types/responses/jikan/characters";
import { QuizManager } from "managers/QuizManager";

const API_URL = "https://api.jikan.moe/v4";

async function requestGet(url: string): Promise<unknown> {
  const data = await axios.get<{ data?: unknown }>(url);
  return data.data;
}

async function fetchMediaData(
  id: number,
  type: QuizType,
): Promise<AnimeResponse | MangaResponse | null> {
  const urlMedia = `${API_URL}/${type}/${id.toString()}`;
  return (await requestGet(urlMedia)) as AnimeResponse | MangaResponse | null;
}

async function fetchCharacters(
  id: number,
  type: QuizType,
): Promise<Character[]> {
  const urlCharacters = `${API_URL}/${type}/${id.toString()}/characters`;
  const response = (await requestGet(
    urlCharacters,
  )) as CharacterResponse | null;
  return response?.data ?? [];
}

function selectRandomCharacter(characters: Character[]): Character | null {
  if (characters.length === 0) return null;
  const random = Math.floor(Math.random() * characters.length);
  return characters[random]!;
}

function formatCharactersList(
  characters: Character[],
  excludeId: number,
): QuizCharacters[] {
  return characters
    .map((c) => ({
      id: c.character.mal_id,
      name: c.character.name,
      image: c.character.images.jpg.image_url,
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
  type: QuizType,
  redis: RedisClient,
  timeouts: Map<string, NodeJS.Timeout>,
  channel: TextChannel,
): Promise<QuizManager | null> {
  const mediaData = await fetchMediaData(id, type);
  if (!mediaData) return null;

  const charactersData = await fetchCharacters(id, type);
  const selectedCharacter = selectRandomCharacter(charactersData);
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
      characters: formatCharactersList(charactersData, characterId),
    },
    titles: mediaInfo.titles,
    url: mediaInfo.url,
    type,
  };

  return new QuizManager(data, redis, timeouts, channel);
}
