import type { RedisClient } from "bun";
import type { TextChannel } from "discord.js";
import type { AnimeResponse } from "types/responses/jikan/anime";
import type { QuizCharacters, QuizData } from "types/quiz";
import type {
  Character,
  CharacterResponse,
} from "types/responses/jikan/characters";
import { QuizManager } from "managers/quiz/QuizManager";
import type { TitleMedia } from "types/responses/title";
import type { PrismaClient } from "generated/prisma";

export class QuizBuilder {
  private readonly API_URL = "https://api.jikan.moe/v4";
  private readonly UNKNOWN =
    "https://cdn.myanimelist.net/images/questionmark_23.gif";

  private async requestGet(url: string): Promise<unknown> {
    let response: Response;
    let status = 429;
    let retries = 0;

    while (status === 429 && retries < 3) {
      response = await fetch(url);
      status = response.status;
      if (!response.ok && status !== 429) return null;
      if (status !== 429) return await response.json();
      const delay = Math.min(1000 * Math.pow(2, retries), 2000);
      await new Promise((res) => setTimeout(res, delay));
      retries++;
    }
  }

  private async fetchMediaData(id: number): Promise<AnimeResponse | null> {
    const urlMedia = `${this.API_URL}/anime/${id.toString()}`;
    return (await this.requestGet(urlMedia)) as AnimeResponse | null;
  }

  private async fetchCharacters(id: number): Promise<Character[]> {
    const urlCharacters = `${this.API_URL}/anime/${id.toString()}/characters`;
    const response = (await this.requestGet(
      urlCharacters,
    )) as CharacterResponse | null;
    return response?.data ?? [];
  }

  private selectRandomCharacter(characters: Character[]): Character | null {
    if (characters.length === 0) return null;
    const random = Math.floor(Math.random() * (characters.length - 1));
    return characters[random]!;
  }

  private formatCharactersList(
    characters: Character[],
    excludeId: number,
  ): QuizCharacters[] {
    return characters
      .map((data) => ({
        id: data.character.mal_id,
        name: data.character.name,
        image: data.character.images.webp.image_url,
      }))
      .filter((c) => c.id !== excludeId);
  }

  private addCustomTitle(titles: TitleMedia[]): TitleMedia[] {
    const newTitles = [...titles];
    const regexMap = new Map([
      [/^.{4,},/g, ","],
      [/^.{4,}:/g, ":"],
      [/^\w+!!/g, "!!"],
    ]);

    for (const title of titles) {
      if (title.type === "Japanese") continue;
      let newTitle: string | undefined = title.title;
      for (const [regex, separator] of regexMap) {
        if (newTitle?.match(regex)) {
          newTitle = newTitle!.split(separator)[0];
        }
      }
      if (
        newTitle &&
        !newTitles.some(
          (t) => t.title.toLocaleLowerCase() === newTitle.toLocaleLowerCase(),
        )
      ) {
        newTitles.push({ type: "Custom", title: newTitle });
      }
    }

    return newTitles;
  }

  private extractMediaInfo(media: AnimeResponse) {
    return {
      titles: this.addCustomTitle(media.data.titles),
      url: media.data.url,
      synopsis: media.data.synopsis,
      genres: media.data.genres.map((genre) => genre.name),
      cover: media.data.images.webp.large_image_url,
    };
  }

  public async buildQuizData(id: number): Promise<QuizData | null> {
    let mediaData: AnimeResponse | null = null;
    do {
      mediaData = await this.fetchMediaData(id);
    } while (!mediaData);

    const charactersData = await this.fetchCharacters(id);
    const characters = charactersData.filter(
      (data) => !data.character.images.webp.image_url.startsWith(this.UNKNOWN),
    );
    const selectedCharacter = this.selectRandomCharacter(characters);
    if (!selectedCharacter) return null;

    const characterId = selectedCharacter.character.mal_id;
    const characterInfo = {
      id: characterId,
      name: selectedCharacter.character.name,
      image: selectedCharacter.character.images.webp.image_url,
    };

    const mediaInfo = this.extractMediaInfo(mediaData);

    return {
      character: characterInfo,
      hint: {
        synopsis: mediaInfo.synopsis,
        genres: mediaInfo.genres,
        cover: mediaInfo.cover,
        characters: this.formatCharactersList(characters, characterId),
      },
      titles: mediaInfo.titles,
      url: mediaInfo.url,
      score: 5,
    };
  }

  public async buildQuizManager(
    id: number,
    redis: RedisClient,
    timeouts: Map<string, NodeJS.Timeout>,
    channel: TextChannel,
    prisma: PrismaClient,
  ): Promise<QuizManager | null> {
    const data: QuizData | null = await this.buildQuizData(id);
    if (!data) return null;
    return new QuizManager(data, redis, timeouts, channel, prisma);
  }
}
