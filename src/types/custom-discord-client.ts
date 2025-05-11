import { Client } from "discord.js";
import type { RedisClient } from "bun";
import type { ClientOptions } from "discord.js";
import type { PrismaClient } from "generated/prisma/index-browser";
import type LLMService from "services/llm";
import type Random from "utils/random";

export default class CustomDiscordClient extends Client {
  public redis!: RedisClient;
  public llm!: LLMService;
  public prisma!: PrismaClient;
  public random!: Random;

  constructor(options: ClientOptions) {
    super(options);
  }
}
