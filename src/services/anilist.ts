import type { AnimeStatus, AnimeStatusId } from "types/anime-status";
import type {
	AnimeListRaw,
	Body,
	UserAnilist,
	UserAnilistRaw,
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

	public async getUser(name: string): Promise<UserAnilist | null> {
		const query = `
      query Query($name: String) {
        User(name: $name) {
          id
          name
          siteUrl
          avatar {
            large
          }
          options {
            profileColor
          }
        }
      }
    `;

		const body: Body = {
			query,
			variables: { name: name },
		};

		const data = (await this._requestAnilistApi(body)) as UserAnilistRaw | null;
		if (!data) return null;

		return data.data.User;
	}

	public async getMalIds(
		id: number,
		name: string,
	): Promise<AnimeStatusId[] | null> {
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

		const data = (await this._requestAnilistApi(body)) as AnimeListRaw | null;
		if (!data) return null;
		const lists = data.data.MediaListCollection.lists.filter(
			(list) => !list.name.toLowerCase().includes("music"),
		);

		const statuses: AnimeStatus[] = [
			"CURRENT",
			"COMPLETED",
			"PAUSED",
			"DROPPED",
			"PLANNING",
		];

		const extractIds = (status: AnimeStatus) =>
			lists
				.filter((list) => list.status === status)
				.flatMap((list) =>
					list.entries
						.filter((entry) => !entry.media.isAdult)
						.map((entry) => entry.media.idMal)
						.filter((id) => id !== null),
				);

		const animes = new Array<AnimeStatusId>();

		for (const status of statuses) {
			animes.push({
				name: status,
				malId: extractIds(status),
			});
		}

		return animes;
	}
}
