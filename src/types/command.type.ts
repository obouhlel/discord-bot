import type {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

export interface Commands {
  data: SlashCommandBuilder;
  execute: (innteraction: ChatInputCommandInteraction) => Promise<void>;
}
