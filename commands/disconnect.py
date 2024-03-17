from bot_instance import bot
from discord.ext import commands
from discord import Interaction

# With prefix command
@bot.command(
    name="disconnect",
    description="Disconnect on voice channel",
)
async def disconnect(ctx: commands.Context):
    if ctx.voice_client is not None:
        await ctx.voice_client.disconnect()
        await ctx.send(f"Disconnected from the voice channel.")
    else:
        await ctx.send("I'm not connected to a voice channel.")

# With slash command
@bot.tree.command(
    name="disconnect",
    description="Disconnect on voice channel",
)
async def disconnect(interaction: Interaction):
    guild = interaction.guild
    if guild.voice_client is not None:
        await guild.voice_client.disconnect()
        await interaction.response.send_message(f"Disconnected from the voice channel.")
    else:
        await interaction.response.send_message("I'm not connected to a voice channel.")