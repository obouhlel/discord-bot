import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import type { Interaction } from "discord.js";
import { commands, commandsInfo } from "./commands";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

client.on(Events.ClientReady, async (readyClient: Client<true>) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);

  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commandsInfo,
    });
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  for (const command of commands) {
    if (interaction.commandName === command.data.name) {
      await command.execute(interaction);
      return;
    }
  }
  await interaction.reply("Command not found");
});

client.login(process.env.DISCORD_TOKEN);
