import Fastify from "fastify";
import routes from "routes";

import cookie from "@fastify/cookie";
// plugins
import helmet from "@fastify/helmet";
import discordPlugin from "plugins/discord";
import prismaPlugin from "plugins/prisma";
import redisPlugin from "plugins/redis";
import tokenPlugin from "plugins/token";

// hooks
import { Events } from "discord.js";
import { guildMemberAdd } from "events/guild-member-add";
import { interactionCreate } from "events/interaction-create";
import { messageCreate } from "events/message-create";

// type
import type { Interaction, Message } from "discord.js";

const fastify = Fastify({
	logger: false,
});

fastify.register(helmet);
fastify.register(cookie, { secret: Bun.env.COOKIE_SECRET });
fastify.register(prismaPlugin);
fastify.register(redisPlugin);
fastify.register(discordPlugin);
fastify.register(tokenPlugin);
fastify.register(routes);

fastify.addHook("onReady", async function () {
	await fastify.discord.client.login();

	fastify.discord.client.once(Events.ClientReady, () => {
		if (!fastify.discord.client.user) return;
		console.log(`✅ | Client is ready ${fastify.discord.client.user.tag}`);
	});

	if (Bun.env.NODE_ENV === "production") {
		await fastify.discord.updateCommands();
	}

	// New message
	fastify.discord.client.on(Events.MessageCreate, async (message: Message) => {
		await messageCreate(message, fastify.discord.messageCommand);
	});

	// Slash commands
	fastify.discord.client.on(
		Events.InteractionCreate,
		async (interaction: Interaction) => {
			await interactionCreate(interaction, fastify.discord.mapSlashCommand);
		},
	);

	// New member in server/guild
	fastify.discord.client.on(Events.GuildMemberAdd, guildMemberAdd);
});

async function start() {
	try {
		await fastify.listen({ host: "0.0.0.0", port: 3000 });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

start().catch((error: unknown) => {
	console.error(error);
});
