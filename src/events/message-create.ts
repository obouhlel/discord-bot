import type { Message } from "discord.js";

export async function handlerMessageCreate(message: Message) {
  const m = message.content.toLowerCase();
  if (m.includes("quoi")) {
    try {
      await message.reply("feur");
    } catch {
      await message.reply("Error server");
    }
    return;
  }
}
