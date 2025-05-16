import type { Message } from "discord.js";
import CustomDiscordClient from "types/custom-discord-client";

export async function messageCreate(message: Message): Promise<void> {
  const client = message.client as CustomDiscordClient;
  const redis = client.redis;
  const llm = client.llm;
  const random = (client.random.next() % 2) + 1;

  try {
    if (!message.inGuild() && !message.author.bot) {
      await message.author.dmChannel?.sendTyping();
      const response = await llm.generateDMMessage(message.content);
      await message.author.send(response);
      return;
    }

    if (
      !message.author.bot &&
      message.mentions.has(message.client.user) &&
      message.inGuild()
    ) {
      await message.channel.sendTyping();
      const response = await llm.generateMessage(message.content);
      await message.channel.send(response);
    }

    if (
      random % 2 &&
      message.content.toLowerCase().includes("quoi") &&
      message.inGuild() &&
      !message.author.bot
    ) {
      const score = Number(await redis.get(`feur:${message.author.id}`)) + 1;
      await redis.set(`feur:${message.author.id}`, String(score));
      await message.channel.send("feur");
    }
  } catch (error) {
    console.error(error);
  }
}
