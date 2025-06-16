import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { PrismaClient } from "generated/prisma";

declare module "fastify" {
	interface FastifyInstance {
		prisma: PrismaClient;
	}
}

const prismaPlugin: FastifyPluginAsync = fp(async (server) => {
	const prisma = new PrismaClient();
	await prisma.$connect();

	server.decorate("prisma", prisma);

	server.addHook("onClose", async (server) => {
		await server.prisma.$disconnect();
	});
});

export default prismaPlugin;
