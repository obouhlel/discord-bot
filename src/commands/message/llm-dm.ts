import type { CommandContext } from "types/message-command";
import MessageCommand from "types/message-command";

export default class LLMDirectMessage extends MessageCommand {
  shouldExecute({ message }: CommandContext): boolean {
    return !message.inGuild() && !message.author.bot;
  }

  async execute({ client, message }: CommandContext): Promise<void> {
    const channel = message.author.dmChannel;

    if (!channel) return;

    await channel.sendTyping();
    const response = await client.llm.generateDMMessage(message.content);
    await channel.send(response);
  }
}
