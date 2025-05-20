import type { FastifyReply } from "fastify";
import type DiscordService from "services/discord";

export function status(discord: DiscordService, reply: FastifyReply) {
  try {
    if (!discord.client.isReady()) {
      reply.status(503).send({
        status: "error",
        message: "Bot is not ready",
      });
      return;
    }

    reply.status(200).send({
      status: "ok",
      message: "Bot is operational",
    });
  } catch (error) {
    console.error("Error checking bot status:", error);

    reply.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
}
