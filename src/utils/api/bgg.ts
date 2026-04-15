import { post } from ".";
import { Paths, useGetList } from "./factory";

export interface RequestGamePayload {
  name: string;
  email: string;
}

export function useGetBggGames() {
  return useGetList<[{ value: string }]>(`${Paths.Games}/bgg`);
}

export function requestGame(payload: RequestGamePayload) {
  return post({
    path: `${Paths.Games}/requested`,
    payload: payload,
  });
}
