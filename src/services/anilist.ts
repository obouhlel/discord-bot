import axios, { AxiosError } from "axios";
import type {
  Body,
  OptionQueryAnilist,
  UserAnilistRaw,
  MediaListRaw,
} from "types/responses/anilist";

export default class AnilistService {
  private readonly _url: string = "https://graphql.anilist.co";

  private async _requestAnilistApi(body: Body): Promise<unknown> {
    const options: OptionQueryAnilist = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    try {
      const { data } = await axios.post<UserAnilistRaw>(
        this._url,
        body,
        options,
      );
      return data;
    } catch (e) {
      if (e instanceof AxiosError) {
        console.error(e.message);
      } else {
        console.error(e);
      }
      return null;
    }
  }

  public async getUser(name: string): Promise<UserAnilistRaw | null> {
    const query = `
      query Query($name: String) {
        User(name: $name) {
          id
          name
          siteUrl
        }
      }
    `;

    const body: Body = {
      query,
      variables: { name: name },
    };

    return (await this._requestAnilistApi(body)) as UserAnilistRaw | null;
  }

  public async getAnimeIds(id: number, name: string): Promise<number[] | null> {
    const query = `
      query Query($userId: Int, $userName: String) {
        MediaListCollection(userId: $userId, userName: $userName, type: ANIME) {
          lists {
            entries {
              media {
                idMal
              }
            }
          }
        }
      }
    `;

    const body: Body = {
      query,
      variables: {
        userId: id,
        userName: name,
      },
    };

    const data = (await this._requestAnilistApi(body)) as MediaListRaw | null;
    if (!data) return null;
    const malIds = data.data.MediaListCollection.lists
      .flatMap((list) => list.entries)
      .map((entry) => entry.media.idMal)
      .filter((id) => id !== null);

    return malIds;
  }

  public async getMangaIds(id: number, name: string): Promise<number[] | null> {
    const query = `
      query Query($userId: Int, $userName: String) {
        MediaListCollection(userId: $userId, userName: $userName, type: MANGA) {
          lists {
            entries {
              media {
                idMal
              }
            }
          }
        }
      }
    `;

    const body: Body = {
      query,
      variables: {
        userId: id,
        userName: name,
      },
    };

    const data = (await this._requestAnilistApi(body)) as MediaListRaw | null;
    if (!data) return null;
    const malIds = data.data.MediaListCollection.lists
      .flatMap((list) => list.entries)
      .map((entry) => entry.media.idMal)
      .filter((id) => id !== null);

    return malIds;
  }
}
