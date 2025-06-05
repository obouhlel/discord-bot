import {
  cuddle,
  echo,
  ping,
  welcome,
  register,
  quiz,
  score,
  leaderboard,
} from "commands/slash";
import type { SlashCommand } from "types/commands/slash";

export function buildSlashCommand(): SlashCommand[] {
  return [cuddle, echo, ping, welcome, register, quiz, score, leaderboard];
}
