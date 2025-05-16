import type { Command } from "types/command";
import { ping } from "./ping";
import { echo } from "./echo";
import { cuddle } from "./cuddle";
import { welcome } from "./welcome";
import { score } from "./score";
import { llm } from "./llm";

export const commandsDatas = [
  ping.data.toJSON(),
  echo.data.toJSON(),
  cuddle.data.toJSON(),
  welcome.data.toJSON(),
  score.data.toJSON(),
  llm.data.toJSON(),
];

export const commands = new Map<string, Command>([
  [ping.data.name, ping],
  [echo.data.name, echo],
  [cuddle.data.name, cuddle],
  [welcome.data.name, welcome],
  [score.data.name, score],
  [llm.data.name, llm],
]);
