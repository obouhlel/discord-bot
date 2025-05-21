import type { RedisClient } from "bun";
import type { FastifyRequest } from "fastify";
import type { User } from "generated/prisma";

export async function getSession(
  request: FastifyRequest,
  redis: RedisClient,
): Promise<User | null> {
  const sessionId = request.cookies.session_id;
  if (!sessionId) {
    return null;
  }

  const sessionRaw = await redis.get(`session:${sessionId}`);
  if (!sessionRaw) return null;
  const session: User = JSON.parse(sessionRaw) as User;

  try {
    return session;
  } catch {
    return null;
  }
}
