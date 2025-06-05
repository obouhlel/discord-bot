export type AnimeStatus =
  | "CURRENT"
  | "COMPLETED"
  | "PAUSED"
  | "DROPPED"
  | "PLANNING";

export enum AnimeStatusEnum {
  CURRENT,
  COMPLETED,
  PAUSED,
  DROPPED,
  PLANNING,
}

export interface AnimeStatusId {
  name: AnimeStatus;
  malId: number[];
}
