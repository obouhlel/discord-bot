import type { FastifyReply, FastifyRequest } from "fastify";

export default class TokenService {
  private tokens: Set<string>;

  constructor() {
    this.tokens = new Set();
  }

  public generateToken(length: number = 32): string {
    const bytes = new Uint8Array(length);
    const token = crypto.getRandomValues(bytes).toHex();
    this.tokens.add(token);
    return token;
  }

  public verifyToken(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers["authorization"];

    if (request.hostname === "localhost") return;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      reply.code(401).send({ error: "Token missing of invalid" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      reply.code(401).send({ error: "Token not set" });
      return;
    }

    if (!this.tokens.has(token)) {
      reply.code(401).send({ error: "Invalid token" });
    }
  }

  public invalidateToken(token: string, reply: FastifyReply) {
    this.tokens.delete(token);
    reply.code(201).send({ success: "Token delete" });
  }
}
