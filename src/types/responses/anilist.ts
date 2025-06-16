import type { AnimeStatus } from "types/anime-status";

export interface UserAnilistRaw {
	data: {
		User: UserAnilist;
	};
}

export interface UserAnilist {
	id: number;
	name: string;
	siteUrl: string;
	avatar: {
		large: string;
	};
	options: {
		profileColor: string;
	};
}

export interface Body {
	query: string;
	variables: {
		[key: string]: string | number;
	};
}

export interface EntryRaw {
	media: {
		idMal: number | null;
		isAdult: boolean;
	};
}

export interface ListRaw {
	name: string;
	status: AnimeStatus;
	entries: EntryRaw[];
}

export interface AnimeListRaw {
	data: {
		MediaListCollection: {
			lists: ListRaw[];
		};
	};
}
