import type { MessageCommand } from "types/message-command";
import PingCommand from "commands/message/ping";
import LLMGuild from "commands/message/llm-guild";
import LLMDirectMessage from "commands/message/llm-dm";

export function buildMessageCommands(): MessageCommand[] {
  return [new PingCommand(), new LLMGuild(), new LLMDirectMessage()];
}
