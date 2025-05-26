import type CustomDiscordClient from "types/custom-discord-client";
import type { Message } from "discord.js";
import type { MessageCommand } from "types/commands/message";

export async function messageCreate(
  message: Message,
  commands: MessageCommand[],
): Promise<void> {
  const client = message.client as CustomDiscordClient;
  const context = { message, client };

  try {
    for (const command of commands) {
      if (await command.shouldExecute(context)) {
        await command.execute(context);
      }
    }
  } catch (error) {
    console.error("Error in messageCreate:", error);
  }
}
