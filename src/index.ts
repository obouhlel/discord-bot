import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
} from "discord.js";
import type { Interaction, Message } from "discord.js";
import { commands, commandsInfo } from "./commands";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.User, Partials.Channel, Partials.Message],
});

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

client.once(Events.ClientReady, async (readyClient: Client<true>) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);

  try {
    console.log("Update slash commands");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commandsInfo,
    });
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply("Command not found");
    return;
  }
  await command.execute(interaction);
});

client.on(Events.MessageCreate, async (message: Message) => {
  console.log(message.content);
  const m = message.content.toLowerCase();
  if (m.includes("quoi")) {
    await message.reply("feur");
    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
