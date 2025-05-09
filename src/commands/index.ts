import { ping } from "./ping";
import { echo } from "./echo";
import { cuddle } from "./cuddle";
import { welcome } from "./welcome";

export const commandsInfo = [
  ping.data.toJSON(),
  echo.data.toJSON(),
  cuddle.data.toJSON(),
  welcome.data.toJSON(),
];
export const commands = new Map<string, any>([
  [ping.data.name, ping],
  [echo.data.name, echo],
  [cuddle.data.name, cuddle],
  [welcome.data.name, welcome],
]);
