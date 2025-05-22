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

export default class AnilistService {
  private readonly _url: string = "https://graphql.anilist.co";

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

    const body: { variables: { name: string }; query: string } = {
      variables: { name },
      query,
    };

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
}
