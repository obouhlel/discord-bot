import type { RedisClient } from "bun";
import type { Message } from "discord.js";
import type LLMService from "../services/llm";

export async function handlerMessageCreate(
  message: Message,
  redis: RedisClient,
  llm: LLMService
) {
  const random: number = Math.round(Math.random() * (100 - 1) + 1);

  if (
    random % 2 &&
    message.content.toLowerCase().includes("quoi") &&
    message.inGuild() &&
    !message.author.bot
  ) {
    const score = Number(await redis.get(`feur:${message.author.id}`)) + 1;
    await redis.set(`feur:${message.author.id}`, String(score));
    message.channel.send("feur");
    return;
  }

  if (message.mentions.has(message.client.user) && message.inGuild()) {
    const m = message.content
      .replace(`<@${message.client.user?.id}>`, "")
      .trim();
    if (m === "") {
      message.channel.send(`# Arrête de me ping !!! <@${message.author.id}>`);
      return;
    } else {
      const response = await llm.generateMessage(m);
      message.channel.send(response);
      return;
    }
  }
}
