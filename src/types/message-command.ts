import type CustomDiscordClient from "./custom-discord-client";
import type { Message } from "discord.js";

export interface CommandContext {
  client: CustomDiscordClient;
  message: Message;
}

export default abstract class MessageCommand {
  abstract shouldExecute(ctx: CommandContext): boolean;
  abstract execute(ctx: CommandContext): Promise<void>;
}
