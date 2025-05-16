import { Routes } from "discord.js";
import type { FastifyReply } from "fastify";
import type DiscordService from "services/discord";

export async function status(
  discord: DiscordService,
  reply: FastifyReply,
): Promise<void> {
  try {
    if (!discord.client.isReady()) {
      reply.status(503).send({
        status: "error",
        message: "Bot is not ready",
      });
      return;
    }

    const commands = await discord.rest.get(
      Routes.applicationCommands(Bun.env.CLIENT_ID),
    );

    reply.status(200).send({
      status: "ok",
      message: "Bot is operational",
      commands: commands,
    });
    return;
  } catch (error) {
    console.error("Error checking bot status:", error);

    reply.status(500).send({
      status: "error",
      message: "Internal server error",
    });
    return;
  }
}
