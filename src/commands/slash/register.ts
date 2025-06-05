import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ColorResolvable,
  DMChannel,
  Message,
} from "discord.js";
import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import AnilistService from "services/anilist";
import type CustomDiscordClient from "types/custom-discord-client";
import { capitalize } from "utils/capitalize";

export const register = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register the anilist or mal")
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .setContexts([InteractionContextType.BotDM]),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomDiscordClient;
    const { prisma } = client;
    const user = interaction.user;

    if (!user.avatar || !user.globalName) {
      await interaction.reply("Please set an avatar or an globale name");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Register")
      .setColor("Blue")
      .setDescription("Chose between Anilist or MyAnimeList");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("register_anilist")
        .setLabel("Anilist")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("register_mal")
        .setLabel("MyAnimeList")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
    );

    await interaction.reply({ embeds: [embed], components: [row] });

    await prisma.user.upsert({
      where: {
        discordId: user.id,
      },
      update: {
        name: user.globalName,
        username: user.username,
        avatarId: user.avatar,
      },
      create: {
        discordId: user.id,
        name: user.globalName,
        username: user.username,
        avatarId: user.avatar,
      },
    });
  },

  async anilist(interaction: ButtonInteraction) {
    const channel = interaction.channel as DMChannel | null;
    const user = interaction.user;
    const { prisma } = interaction.client as CustomDiscordClient;
    if (!channel) {
      await interaction.reply("Please use it in the dm of bot channel");
      return;
    }
    await interaction.reply("Please send your Anilist username");

    const filter = (message: Message) =>
      message.author.id === interaction.user.id;
    const collector = channel.createMessageCollector({
      filter,
      max: 1,
      time: 15_000,
    });

    // eslint-disable-next-line
    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await channel.send("Time out - No response received");
        return;
      }
      const username = collected.first()?.content;
      if (!username) {
        await channel.send("Please send only the username");
        return;
      }
      const anilist = new AnilistService();
      const anilistUser = await anilist.getUser(username);
      if (!anilistUser) {
        const embed = new EmbedBuilder()
          .setTitle("Error")
          .setColor("Red")
          .setDescription("User not found");
        await channel.send({ embeds: [embed] });
        return;
      }

      const dbUser = await prisma.user.findUnique({
        where: {
          discordId: user.id,
        },
      });
      if (!dbUser) {
        await channel.send("Please retry the command `/register`");
        return;
      }

      const animes = await anilist.getMalIds(anilistUser.id, anilistUser.name);
      if (!animes) {
        await channel.send("Please retry the command `/register`");
        return;
      }

      await prisma.animeListUser.upsert({
        where: {
          userId: dbUser.id,
        },
        create: {
          type: "ANILIST",
          typeId: anilistUser.id,
          username: anilistUser.name,
          status: ["CURRENT", "COMPLETED", "DROPPED", "PAUSED", "PLANNING"],
          animes: {
            createMany: {
              data: animes,
            },
          },
          userId: dbUser.id,
        },
        update: {
          type: "ANILIST",
          typeId: anilistUser.id,
          username: anilistUser.name,
          animes: {
            deleteMany: {},
            createMany: {
              data: animes,
            },
          },
          userId: dbUser.id,
        },
      });

      const nbAnimes = animes
        .flatMap((status) => status.malId)
        .flat()
        .length.toString();

      const embed = new EmbedBuilder()
        .setTitle(capitalize(anilistUser.name))
        .setImage(anilistUser.avatar.large)
        .setColor(
          capitalize(anilistUser.options.profileColor) as ColorResolvable,
        )
        .setDescription(
          `User found with ${nbAnimes}, if you want to sort please type \`/filter\``,
        )
        .setURL(anilistUser.siteUrl);

      await channel.send({ embeds: [embed] });
    });
  },
};
