import type { Interaction } from "discord.js";
import { commands } from "commands";

export async function interactionCreate(
  interaction: Interaction,
): Promise<void> {
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
