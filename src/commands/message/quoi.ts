import type { TextChannel } from "discord.js";
import type { MessageCommandContext } from "types/message-command";
import { MessageCommand } from "types/message-command";
import Random from "utils/random";

export default class QuoiCommand extends MessageCommand {
  public readonly data = {
    name: "Quoi",
    description: "Send feur in 50% chances",
  };

  private random: Random;

  constructor() {
    super();
    this.random = new Random();
  }

  shouldExecute({ message }: MessageCommandContext): boolean {
    const random = (this.random.next() % 2) + 1;

    return (
      Boolean(random % 2) &&
      message.content.toLowerCase().includes("quoi") &&
      message.inGuild() &&
      !message.author.bot
    );
  }

  async execute({ client, message }: MessageCommandContext): Promise<void> {
    const redis = client.redis;
    const channel = message.channel as TextChannel;
    const score = Number(await redis.get(`feur:${message.author.id}`)) + 1;

    await redis.set(`feur:${message.author.id}`, String(score));
    await channel.send("feur");
  }
}
