import PingCommand from "commands/message/ping";
import Quiz from "commands/message/quiz";
import type { MessageCommand } from "types/commands/message";

export function buildMessageCommands(): MessageCommand[] {
	return [new PingCommand(), new Quiz()];
}
