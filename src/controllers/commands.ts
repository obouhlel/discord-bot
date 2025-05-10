import { Routes, REST } from "discord.js";
import type { FastifyReply } from "fastify";
import type DiscordService from "../services/discord";

export async function commandsGET(rest: REST, reply: FastifyReply) {
  try {
    const commands = await rest.get(
      Routes.applicationCommands(process.env.CLIENT_ID!)
    );
    await reply.status(200).send({
      commands: commands,
    });
  } catch (error) {
    console.error(error);
    await reply.status(500).send({
      status: "error",
      message: "Cannot get commands",
    });
  }
}

export async function commandsPUT(
  discord: DiscordService,
  reply: FastifyReply
) {
  try {
    await discord.updateCommands();
    reply.status(200).send({
      status: "success",
      message: "✅ Commands have been successfully updated!",
    });
  } catch (error) {
    console.error("❌ Error updating commands:", error);
    reply.status(500).send({
      status: "error",
      message:
        "❌ Failed to update commands. Please check the logs for more details.",
    });
  }
}
