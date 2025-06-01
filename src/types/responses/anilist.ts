export interface UserAnilistRaw {
  data: {
    User: {
      id: number;
      name: string;
      siteUrl: string;
    };
  };
}

export interface Body {
  query: string;
  // eslint-disable-next-line
  variables: {
    [key: string]: string | number;
  };
}

export interface EntryRaw {
  media: {
    idMal: number | null;
  };
}

export interface ListRaw {
  entries: EntryRaw[];
}

export interface MediaListRaw {
  data: {
    MediaListCollection: {
      lists: ListRaw[];
    };
  };
}
