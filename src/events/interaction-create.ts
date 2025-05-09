import type { FastifyInstance } from "fastify";
import type { Interaction } from "discord.js";
import { commands } from "../commands";

export async function handlerInteractionCreate(
  interaction: Interaction,
  fastify: FastifyInstance
) {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply("Command not found");
    return;
  }
  try {
    await command.execute(interaction, fastify);
  } catch {
    await interaction.reply("Error server");
  }
}
