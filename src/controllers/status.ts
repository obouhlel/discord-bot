import { Routes, type Client, type REST } from "discord.js";
import type { FastifyReply } from "fastify";

export async function status(client: Client, rest: REST, reply: FastifyReply) {
  try {
    if (!client.isReady()) {
      return reply.status(503).send({
        status: "error",
        message: "Bot is not ready",
      });
    }

    const commands = await rest.get(
      Routes.applicationCommands(process.env.CLIENT_ID!)
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
