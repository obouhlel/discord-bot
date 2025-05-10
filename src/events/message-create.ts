import type { RedisClient } from "bun";
import type { Message } from "discord.js";
import type LLMService from "../services/llm";

export async function handlerMessageCreate(
  message: Message,
  redis: RedisClient,
  llm: LLMService
) {
  const random: number = Math.round(Math.random() * (100 - 1) + 1);

  try {
    if (!message.inGuild()) {
      await message.author.dmChannel?.sendTyping();
      const response = await llm.generateMessage(message.content);
      message.author.send(response);
      return;
    }

    if (!message.author.bot && random % 2 && message.inGuild()) {
      await message.channel.sendTyping();
      const response = await llm.generateMessage(message.content);
      message.channel.send(response);
    }

    if (
      !message.author.bot &&
      message.mentions.has(message.client.user) &&
      message.inGuild()
    ) {
      const m = message.content
        .replace(`<@${message.client.user?.id}>`, "")
        .trim();
      if (m === "") {
        message.channel.send(
          `### Stop to ping me, <@${message.author.id}> !!!`
        );
      } else {
        await message.channel.sendTyping();
        const response = await llm.generateMessage(m);
        message.channel.send(response);
      }
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
