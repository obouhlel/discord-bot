from bot_instance import bot
from utils import *
from discord.ext import commands
from discord import Interaction, FFmpegPCMAudio
import asyncio

# With prefix command
@bot.command(
    name="play",
    description="Play a sound",
)
async def play(ctx: commands.Context):
    voice_client = ctx.voice_client
    if not voice_client:
        await ctx.send("I'm not connected to a voice channel.")
        return
    source = FFmpegPCMAudio('sound/sound.mp3')
    voice_client.play(source)


# With slash command
@bot.tree.command(
    name="play",
    description="Play a sound",
)
async def play(interaction: Interaction):
    voice_client = interaction.guild.voice_client
    if not voice_client:
        await interaction.response.send_message("I'm not connected to a voice channel.")
        return
    source = FFmpegPCMAudio('sound/sound.mp3')
    voice_client.play(source)
    await interaction.response.send_message("Sound is playing...")
    while voice_client.is_playing():
        await asyncio.sleep(1)
    await interaction.followup.send("Sound is finished.")
