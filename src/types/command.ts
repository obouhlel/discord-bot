import type {
  SlashCommandBuilder,
  SlashCommandAttachmentOption,
  SlashCommandOptionsOnlyBuilder,
  ContextMenuCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

export type CommandData =
  | SlashCommandBuilder
  | SlashCommandAttachmentOption
  | SlashCommandOptionsOnlyBuilder
  | ContextMenuCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export interface Command {
  data: CommandData;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
