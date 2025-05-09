import type { Interaction } from "discord.js";
import { commands } from "../commands";

export async function handlerInteractionCreate(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply("Command not found");
    return;
  }
  try {
    await command.execute(interaction);
  } catch {
    await interaction.reply("Error server");
  }
}
