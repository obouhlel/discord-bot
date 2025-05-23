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

    const anime = (await this._requestGet(url)) as { data: Anime } | null;
    if (!anime) return null;

    return anime.data;
  }

  public async getMangaInfo(id: number): Promise<Manga | null> {
    const url = this._url + `/manga/${id.toString()}/full`;

    const manga = (await this._requestGet(url)) as { data: Manga } | null;
    if (!manga) return null;

    return manga.data;
  }
}
