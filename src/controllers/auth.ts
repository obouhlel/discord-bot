import type { FastifyReply, FastifyRequest } from "fastify";
import type TokenService from "services/tokens";

export async function auth(
  tokenService: TokenService,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { username, password } = request.body as {
    username: string;
    password: string;
  };

  if (username === Bun.env.USERNAME && password === Bun.env.PASSWORD) {
    const token = tokenService.generateToken(32);
    return reply.code(200).send({ token });
  }
  return reply.code(401).send({ error: "Invalid credentials" });
}
