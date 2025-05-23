import {
  cuddle,
  echo,
  llm,
  ping,
  welcome,
  anilist,
  quiz,
} from "commands/slash";
import type { SlashCommand } from "types/slash-command";

export function buildSlashCommand(): SlashCommand[] {
  return [cuddle, echo, llm, ping, welcome, anilist, quiz];
}
