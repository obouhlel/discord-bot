import type { Client } from "discord.js";
import type { FastifyReply } from "fastify";

export async function status(client: Client, reply: FastifyReply) {
  try {
    return reply.send({ user: client.user?.tag });
  } catch (error) {
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
