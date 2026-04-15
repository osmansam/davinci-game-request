import { post } from ".";
import { Paths, useGetList } from "./factory";

export interface BGGGameRow {
  name: string;
  email: string;
}

export function useGetBggGames() {
  return useGetList<{ name: string }>(`${Paths.Games}/bgg`);
}

export function requestGame(payload: BGGGameRow) {
  return post({
    path: `${Paths.Games}/requested`,
    payload: payload,
  });
}
