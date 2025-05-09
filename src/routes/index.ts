import type { FastifyInstance } from "fastify";
import { status } from "../controllers";

export default async function routes(fastify: FastifyInstance) {
  fastify.get("/", async (_, reply) => {
    return status(fastify.discord, reply);
  });
}
