import type { Interaction } from "discord.js";
import type { SlashCommand } from "types/slash-command";

export async function interactionCreate(
  interaction: Interaction,
  commands: Map<string, SlashCommand>,
): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply("Command not found");
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply(`${command.data.name} an error occured`);
    await interaction.editReply(`${command.data.name} an error occured`);
  }
}
