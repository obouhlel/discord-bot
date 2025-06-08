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

export class QuizBuilder {
  private readonly API_URL = "https://api.jikan.moe/v4";
  private readonly UNKNOWN =
    "https://cdn.myanimelist.net/images/questionmark_23.gif";

  private async requestGet(url: string): Promise<unknown> {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return await response.json();
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
    let selectedCharacter: Character | null = null;
    let characters: Character[];
    do {
      do {
        mediaData = await this.fetchMediaData(id);
      } while (!mediaData);
      const charactersData = await this.fetchCharacters(id);
      characters = charactersData.filter(
        (data) =>
          !data.character.images.webp.image_url.startsWith(this.UNKNOWN),
      );
      selectedCharacter = this.selectRandomCharacter(characters);
    } while (selectedCharacter === null);

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
  ): Promise<QuizManager | null> {
    const data: QuizData | null = await this.buildQuizData(id);
    if (!data) return null;
    return new QuizManager(data, redis, timeouts, channel);
  }
}
