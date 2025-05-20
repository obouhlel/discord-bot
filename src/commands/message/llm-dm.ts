import type { MessageCommandContext } from "types/message-command";
import { MessageCommand } from "types/message-command";

export default class LLMDirectMessage extends MessageCommand {
  public readonly data = {
    name: "LLM Direct Message",
    description: "Send a message to LLM agent and reply in direct message",
  };

  shouldExecute({ message }: MessageCommandContext): boolean {
    return !message.inGuild() && !message.author.bot;
  }

  async execute({ client, message }: MessageCommandContext): Promise<void> {
    const channel = message.author.dmChannel;

    if (!channel) return;

    await channel.sendTyping();
    const response = await client.llm.generateDMMessage(message.content);
    await channel.send(response);
  }
}
