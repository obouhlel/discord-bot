import type CustomDiscordClient from "./custom-discord-client";
import type { Message } from "discord.js";

export interface MessageCommandContext {
  client: CustomDiscordClient;
  message: Message;
}

export interface MessageCommandData {
  name: string;
  description: string;
}

export abstract class MessageCommand {
  public abstract readonly data: MessageCommandData;

  abstract shouldExecute(
    ctx: MessageCommandContext,
  ): boolean | Promise<boolean>;
  abstract execute(ctx: MessageCommandContext): Promise<void>;
}
