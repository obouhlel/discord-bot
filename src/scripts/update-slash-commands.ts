import { REST, Routes } from "discord.js";
import { commandsInfo } from "../commands";

async function update() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);
  try {
    console.log("🔄 | Updating slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commandsInfo,
    });
    console.log("✅ | Slash commands updated successfully.");
  } catch (error) {
    console.error("❌ | Failed to update slash commands:", error);
  }
}

update();
