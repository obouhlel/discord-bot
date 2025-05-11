import type { Message } from "discord.js";
import CustomDiscordClient from "types/custom-discord-client";

export async function handlerMessageCreate(message: Message) {
  const client = message.client as CustomDiscordClient;
  const redis = client.redis;
  const llm = client.llm;
  const random = client.random.next();

  try {
    if (!message.inGuild() && !message.author.bot) {
      await message.author.dmChannel?.sendTyping();
      const response = await llm.generateMessage(message.content);
      message.author.send(response);
      return;
    }

    if (
      !message.author.bot &&
      message.mentions.has(message.client.user) &&
      message.inGuild()
    ) {
      await message.channel.sendTyping();
      const response = await llm.generateMessage(message.content);
      message.channel.send(response);
    }

    if (
      random % 2 &&
      message.content.toLowerCase().includes("quoi") &&
      message.inGuild() &&
      !message.author.bot
    ) {
      const score = Number(await redis.get(`feur:${message.author.id}`)) + 1;
      await redis.set(`feur:${message.author.id}`, String(score));
      message.channel.send("feur");
    }
  } catch (error) {
    console.error(error);
  }
}
