import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  type AnySelectMenuInteraction,
} from "discord.js";
import type { AnimeStatus } from "generated/prisma";
import type CustomDiscordClient from "types/custom-discord-client";
import { capitalize } from "utils/capitalize";

export const filter = {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Filter the status of your list")
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),

  async execute(interaction: ChatInputCommandInteraction) {
    const { prisma } = interaction.client as CustomDiscordClient;
    const user = interaction.user;

    await interaction.reply({
      content: "Find the user in database ...",
      flags: ["Ephemeral"],
    });

    const dbUser = await prisma.user.findUnique({
      where: {
        discordId: user.id,
      },
      include: {
        animeListUser: true,
      },
    });

    if (!dbUser?.animeListUser) {
      await interaction.editReply({
        content: "User not found please try `/register`, or contact oustoky",
      });
      return;
    }

    const statusUser = dbUser.animeListUser.status as string[];
    const status = ["CURRENT", "COMPLETED", "DROPPED", "PAUSED", "PLANNING"];

    const select = new StringSelectMenuBuilder()
      .setCustomId("filter_status")
      .setPlaceholder("Select statuses")
      .setMinValues(1)
      .setMaxValues(status.length)
      .addOptions(
        status.map((s, index) => ({
          label: capitalize(s.toLowerCase()),
          value: s,
          default: statusUser[index] === s,
        })),
      );

    await interaction.editReply({
      content: "Select statuses to filter:",
      components: [{ type: 1, components: [select] }],
    });
  },

  async update(interaction: AnySelectMenuInteraction) {
    const { prisma } = interaction.client as CustomDiscordClient;
    const values = interaction.values as AnimeStatus[];
    const user = interaction.user;

    const dbUser = await prisma.user.findUnique({
      where: {
        discordId: user.id,
      },
      include: {
        animeListUser: true,
      },
    });

    if (!dbUser?.animeListUser) {
      await interaction.editReply({
        content: "User not found please try `/register`, or contact oustoky",
      });
      return;
    }

    await prisma.animeListUser.update({
      where: {
        id: dbUser.animeListUser.id,
      },
      data: {
        status: values,
      },
    });

    await interaction.reply({
      content: "Status filters have been applied",
      flags: ["Ephemeral"],
    });
  },
};
