import type {
	ChatInputCommandInteraction,
	ContextMenuCommandBuilder,
	SlashCommandAttachmentOption,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
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
