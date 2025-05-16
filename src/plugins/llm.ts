import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import LLMService from "services/llm";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    llm: LLMService;
  }
}

const llmPlugin = fp(function (
  server: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) {
  const llm = new LLMService();
  server.decorate("llm", llm);
  done();
});

export default llmPlugin;
