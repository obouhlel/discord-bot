import type { FastifyInstance } from "fastify";
import { status } from "../controllers";

export default async function routes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    return status(fastify.discord, reply);
  });
}
