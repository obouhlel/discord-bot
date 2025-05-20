import { cuddle, echo, llm, ping, score, welcome } from "commands/slash";
import type { SlashCommand } from "types/slash-command";

export function buildSlashCommand(): SlashCommand[] {
  return [cuddle, echo, llm, ping, score, welcome];
}
