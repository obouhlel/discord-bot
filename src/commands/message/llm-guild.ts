import type { TextChannel } from "discord.js";
import type { CommandContext } from "types/message-command";
import MessageCommand from "types/message-command";

export default class LLMGuild extends MessageCommand {
  shouldExecute({ client, message }: CommandContext): boolean {
    return Boolean(
      client.user &&
        !message.author.bot &&
        message.mentions.has(client.user) &&
        message.inGuild(),
    );
  }

  async execute({ client, message }: CommandContext): Promise<void> {
    const channel = message.channel as TextChannel;
    const llm = client.llm;

    await channel.sendTyping();
    const response = await llm.generateMessage(message.content);
    await channel.send(response);
  }
}
