import type { TextChannel } from "discord.js";
import type { CommandContext } from "types/message-command";
import MessageCommand from "types/message-command";

export default class PingCommand extends MessageCommand {
  shouldExecute({ message }: CommandContext): boolean {
    return message.content.toLowerCase() === "ping";
  }

  async execute({ message }: CommandContext): Promise<void> {
    const channel = message.channel as TextChannel;
    await channel.send("pong");
  }
}
