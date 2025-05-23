import type { MessageCommand } from "types/message-command";
import PingCommand from "commands/message/ping";
import LLMGuild from "commands/message/llm-guild";
import LLMDirectMessage from "commands/message/llm-dm";
import Quiz from "commands/message/quiz";

export function buildMessageCommands(): MessageCommand[] {
  return [
    new PingCommand(),
    new Quiz(),
    new LLMGuild(),
    new LLMDirectMessage(),
  ];
}
