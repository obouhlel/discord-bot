from bot_instance import bot
from discord.ext import commands
from discord import Interaction

# With prefix command
@bot.command(
    name="connect",
    description="Connect on voice channel",
)
async def connect(ctx: commands.Context):
    if ctx.author.voice is None:
        return await ctx.send("You are not connected to a voice channel.")
    await ctx.author.voice.channel.connect()
    await ctx.send(f"Connected to {ctx.author.voice.channel.name}.")    

# With slash command
@bot.tree.command(
    name="connect",
    description="Connect on voice channel",
)
async def connect(interaction: Interaction):
    member = interaction.guild.get_member(interaction.user.id)
    if member.voice is None:
        return await interaction.response.send_message("You are not connected to a voice channel.")
    await member.voice.channel.connect()
    await interaction.response.send_message(f"Connected to {member.voice.channel.name}.")