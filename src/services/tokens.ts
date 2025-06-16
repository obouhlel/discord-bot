import type { FastifyReply, FastifyRequest } from "fastify";

export default class TokenService {
	private _tokens: Set<string>;

	constructor() {
		this._tokens = new Set();
	}

	public generateToken(length = 32): string {
		const bytes = new Uint8Array(length);
		const token = crypto.getRandomValues(bytes).toHex();
		this._tokens.add(token);
		return token;
	}

	public async verifyToken(request: FastifyRequest, reply: FastifyReply) {
		const authHeader = request.headers.authorization;

		if (request.hostname === "localhost") return;

		if (!authHeader?.startsWith("Bearer ")) {
			await reply.code(401).send({ error: "Token missing of invalid" });
			return;
		}

		const token = authHeader.split(" ")[1];

		if (!token) {
			await reply.code(401).send({ error: "Token not set" });
			return;
		}

		if (!this._tokens.has(token)) {
			await reply.code(401).send({ error: "Invalid token" });
		}
	}

	public invalidateToken(token: string, reply: FastifyReply) {
		this._tokens.delete(token);
		reply.code(201).send({ success: "Token delete" });
	}
}
