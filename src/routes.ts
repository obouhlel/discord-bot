import { auth } from "controllers/auth";
import { getCommands, updateCommands } from "controllers/commands";
import { oauthDiscord, redirectDiscord } from "controllers/oauth";
import { getSession } from "controllers/session";
import { status } from "controllers/status";
import type { FastifyInstance } from "fastify";

export default function routes(fastify: FastifyInstance) {
	const { discord, token, prisma, redis } = fastify;

	// Status for heathcheck
	fastify.get("/", (_, reply) => {
		status(discord, reply);
	});

	// OAuth Discord
	fastify.get("/auth/discord/login", async (_, reply) => {
		await redirectDiscord(reply);
	});

	fastify.get("/auth/discord/callback", async (request, reply) => {
		await oauthDiscord(request, reply, prisma, redis);
	});

	// Get user by session_id
	fastify.get("/me", async (request, reply) => {
		const me = await getSession(request, redis);

		if (!me) return reply.status(401).send({ error: "Not authenticated" });
		await reply.send(me);
	});

	// Logout
	fastify.post("/logout", async (request, reply) => {
		const sessionId = request.cookies.session_id;
		if (sessionId) {
			await fastify.redis.del(`session:${sessionId}`);
			reply.clearCookie("session_id", {
				path: "/",
				httpOnly: true,
				domain: Bun.env.NODE_ENV === "production" ? ".neko.oustopie.xyz" : "",
				sameSite: "lax",
			});
			return reply.send({ success: true });
		}
		return reply.send({ success: false });
	});

	// Get Commands for the front
	fastify.get("/commands", (_, reply) => {
		return getCommands(discord, reply);
	});

	// Auth in api to get token
	fastify.post("/auth", async (request, reply) => {
		await auth(token, request, reply);
	});

	// Update command with token if it's not in localhost
	fastify.put(
		"/commands/update",
		{
			preHandler: async (request, reply) => {
				await token.verifyToken(request, reply);
			},
		},
		(_, reply) => {
			return updateCommands(discord, reply);
		},
	);
}
