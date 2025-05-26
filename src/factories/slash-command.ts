import { cuddle, echo, ping, welcome, anilist, quiz } from "commands/slash";
import type { SlashCommand } from "types/commands/slash";

export function buildSlashCommand(): SlashCommand[] {
  return [cuddle, echo, ping, welcome, anilist, quiz];
}
