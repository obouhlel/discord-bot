import axios from "axios";
import type { Character, CharacterResponse } from "types/characters";
import type { AnimeResponse } from "types/anime-response";
import type { QuizData, QuizType } from "types/quiz";
import type { MangaResponse } from "types/manga-response";

export default class JikanService {
  private readonly _url = "https://api.jikan.moe/v4";

  private async _requestGet(url: string): Promise<unknown> {
    const data = await axios.get<{ data?: unknown }>(url);

    return data.data;
  }

  public async getQuizData(
    id: number,
    type: QuizType,
  ): Promise<QuizData | null> {
    const urlMedia = this._url + `/${type}/${id.toString()}`;
    const urlCharacters = this._url + `/${type}/${id.toString()}/characters`;
    let anime = null;
    let manga = null;

    if (type === "anime") {
      anime = (await this._requestGet(urlMedia)) as AnimeResponse | null;
      if (!anime) return null;
    } else {
      manga = (await this._requestGet(urlMedia)) as MangaResponse | null;
      if (!manga) return null;
    }
    const charactersResponse = (await this._requestGet(
      urlCharacters,
    )) as CharacterResponse | null;
    if (!charactersResponse) return null;

    const characters: Character[] = charactersResponse.data;
    if (characters.length === 0) return null;
    const random: number = Math.floor(Math.random() * (characters.length - 1));
    const character: Character = characters[random]!;

    const name = character.character.name;
    const images = character.character.images.jpg.image_url;
    const role = character.role;

    const titles = type === "anime" ? anime!.data.titles : manga!.data.titles;
    const url = type === "anime" ? anime!.data.url : manga!.data.url;

    const synopsis =
      type === "anime" ? anime!.data.synopsis : manga!.data.synopsis;

    const number =
      type === "anime" ? anime!.data.episodes : manga!.data.chapters;

    const year =
      type === "anime"
        ? anime!.data.year
        : manga!.data.published.prop.from.year;

    const genres =
      type === "anime"
        ? anime!.data.genres.map((genre) => genre.name)
        : manga!.data.genres.map((genre) => genre.name);

    const quizData: QuizData = {
      character: {
        name,
        images,
        role,
      },
      hint: {
        synopsis,
        number,
        year,
        genres,
      },
      titles,
      url,
    };

    return quizData;
  }
}
