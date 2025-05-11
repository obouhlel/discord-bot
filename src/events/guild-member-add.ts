import type CustomDiscordClient from "types/custom-discord-client";
import type { GuildMember, TextChannel } from "discord.js";
import { ChannelType } from "discord.js";

export async function handlerGuildMemberAdd(member: GuildMember) {
  const client = member.client as CustomDiscordClient;
  const redis = client.redis;

  try {
    const channelId = await redis.get(`welcome:${member.guild.id}`);
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) return;

    await channel.send(`Bienvenue sur le serveur, ${member.user}! 🎉`);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de bienvenue :", error);
  }
}
