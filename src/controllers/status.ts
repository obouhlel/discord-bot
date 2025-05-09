import type { Client } from "discord.js";
import type { FastifyReply } from "fastify";

export async function status(client: Client, reply: FastifyReply) {
  try {
    if (!client.isReady()) {
      return reply.status(503).send({
        status: "error",
        message: "Bot is not ready",
      });
    }

    return reply.status(200).send({
      status: "ok",
      message: "Bot is operational",
    });
  } catch (error) {
    console.error("Error checking bot status:", error);

    return reply.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
}
