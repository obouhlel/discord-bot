import type {
  SlashCommandBuilder,
  SlashCommandAttachmentOption,
  SlashCommandOptionsOnlyBuilder,
  ContextMenuCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

export type SlashCommandData =
  | SlashCommandBuilder
  | SlashCommandAttachmentOption
  | SlashCommandOptionsOnlyBuilder
  | ContextMenuCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export interface SlashCommand {
  data: SlashCommandData;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
