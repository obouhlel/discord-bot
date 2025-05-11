import type { FastifyPluginAsync } from "fastify";
import LLMService from "services/llm";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    llm: LLMService;
  }
}

const llmPlugin: FastifyPluginAsync = fp(async (server) => {
  const llm = new LLMService();

  server.decorate("llm", llm);
});

export default llmPlugin;
