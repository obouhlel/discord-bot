import axios from "axios";
import type { Anime } from "types/anime";
import type { Manga } from "types/manga";

export default class JikanService {
  private readonly _url = "https://api.jikan.moe/v4";

  private async _requestGet(url: string): Promise<unknown> {
    const data = await axios.get<{ data?: unknown }>(url);

    return data.data;
  }

  public async getAnimeInfo(id: number): Promise<Anime | null> {
    const url = this._url + `/anime/${id.toString()}/full`;

    const anime = (await this._requestGet(url)) as Anime | null;

    if (!anime) return null;

    console.log(anime);

    return anime;
  }

  public async getMangaInfo(id: number): Promise<Manga | null> {
    const url = this._url + `/manga/${id.toString()}/full`;

    const manga = (await this._requestGet(url)) as Manga | null;

    if (!manga) return null;

    console.log(manga);

    return manga;
  }
}
