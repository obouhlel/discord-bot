import { Routes } from "discord.js";
import type { FastifyReply } from "fastify";
import type DiscordService from "services/discord";

export async function status(discord: DiscordService, reply: FastifyReply) {
  try {
    if (!discord.client.isReady()) {
      return reply.status(503).send({
        status: "error",
        message: "Bot is not ready",
      });
    }

    const commands = await discord.rest.get(
      Routes.applicationCommands(Bun.env.CLIENT_ID)
    );

    return reply.status(200).send({
      status: "ok",
      message: "Bot is operational",
      commands: commands,
    });
  } catch (error) {
    console.error("Error checking bot status:", error);

    return reply.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
}
