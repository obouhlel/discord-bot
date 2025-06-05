import type {
  Body,
  UserAnilistRaw,
  MediaListRaw,
} from "types/responses/anilist";

export default class AnilistService {
  private readonly _url: string = "https://graphql.anilist.co";

  private async _requestAnilistApi(body: Body): Promise<unknown> {
    const request = new Request(this._url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    try {
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error("Anilist not found");
      }
      const data = await response.json();
      return data;
    } catch (e) {
      console.error(e);
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

  public async getMalIds(id: number, name: string): Promise<number[] | null> {
    const query = `
    query MediaListCollection($userId: Int, $userName: String) {
      MediaListCollection(userId: $userId, userName: $userName, type: ANIME) {
        lists {
          name
          status
          entries {
            media {
              idMal
              isAdult
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
    console.log(data);

    return [];
  }
}
