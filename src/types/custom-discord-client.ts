import type { RedisClient } from "bun";
import { Client } from "discord.js";
import type { PrismaClient } from "generated/prisma";

export default class CustomDiscordClient extends Client {
	public redis!: RedisClient;
	public prisma!: PrismaClient;
	public timeouts!: Map<string, NodeJS.Timeout>;
}
