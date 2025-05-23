import type { MessageCommand } from "types/message-command";
import PingCommand from "commands/message/ping";
import Quiz from "commands/message/quiz";

export function buildMessageCommands(): MessageCommand[] {
  return [new PingCommand(), new Quiz()];
}
