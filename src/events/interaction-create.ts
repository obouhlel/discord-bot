import type {
  AnySelectMenuInteraction,
  ButtonInteraction,
  Interaction,
} from "discord.js";
import type { SlashCommand } from "types/commands/slash";

export async function interactionCreate(
  interaction: Interaction,
  commands: Map<string, SlashCommand>,
): Promise<void> {
  // Change this block after
  if (interaction.isAnySelectMenu()) {
    if (interaction.customId.startsWith("filter")) {
      const command = commands.get("filter") as
        | {
            update: (interaction: AnySelectMenuInteraction) => Promise<void>;
          }
        | undefined;
      if (!command) return;
      try {
        await command.update(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  }
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
  //
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
