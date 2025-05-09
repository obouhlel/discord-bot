import { ping } from "./ping";
import { echo } from "./echo";
import { cuddle } from "./cuddle";

export const commandsInfo = [
  ping.data.toJSON(),
  echo.data.toJSON(),
  cuddle.data.toJSON(),
];
export const commands = new Map<string, any>([
  [ping.data.name, ping],
  [echo.data.name, echo],
  [cuddle.data.name, cuddle],
]);
