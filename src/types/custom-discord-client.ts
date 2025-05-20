import { Client } from "discord.js";
import type { RedisClient } from "bun";
import type { PrismaClient } from "generated/prisma/index-browser";
import type LLMService from "services/llm";

export default class CustomDiscordClient extends Client {
  public redis!: RedisClient;
  public llm!: LLMService;
  public prisma!: PrismaClient;
}
