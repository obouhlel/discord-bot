import axios, { AxiosError } from "axios";

interface UserAnilistRaw {
  data: {
    User: {
      id: number;
      name: string;
      siteUrl: string;
    };
  };
}

interface OptionQueryAnilist {
  headers: {
    "Content-Type": string;
    Accept: string;
  };
}

interface Body {
  query: string;
  // eslint-disable-next-line
  variables: {
    [key: string]: string | number;
  };
}

interface EntryRaw {
  media: {
    idMal: number | null;
  };
}

interface ListRaw {
  entries: EntryRaw[];
}

interface MediaListRaw {
  data: {
    MediaListCollection: {
      lists: ListRaw[];
    };
  };
}

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

  public async getAnimesId(id: number, name: string): Promise<number[] | null> {
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

  public async getMangasId(id: number, name: string): Promise<number[] | null> {
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
