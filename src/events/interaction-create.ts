import type { ButtonInteraction, Interaction } from "discord.js";
import type { SlashCommand } from "types/commands/slash";

export async function interactionCreate(
  interaction: Interaction,
  commands: Map<string, SlashCommand>,
): Promise<void> {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("register")) {
      const command = commands.get("register") as
        | { anilist: (interaction: ButtonInteraction) => Promise<void> }
        | undefined;
      if (!command) return;
      try {
        await command.anilist(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  }
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
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(`${command.data.name} an error occured`);
    } else {
      await interaction.reply(`${command.data.name} an error occured`);
    }
  }
}
