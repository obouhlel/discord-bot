from bot_instance import bot
from utils import *
from discord.ext import commands
from discord import Interaction

# With prefix command
@bot.command(
    name="times",
    description="Get times of pray with an URL",
    options=[
        {
            "name": "url",
            "description": "URL of Mawaqit website",
            "type": 3,
            "required": True
        }
    ]
)
async def times(ctx: commands.Context, url: str = None):
    try:
        if not url:
            await ctx.send("You need to provide an URL.")
            return
        times = get_times(url)
        if times:
            times_str = "\n".join([f"- {key} : {value}" for key, value in times.items()])
            await ctx.send(times_str)
        else:
            await ctx.send("Error getting times. Check the URL and try again.")
    except Exception as e:
        await ctx.send("An error occurred. Please try again.")
        print(f"Error: {e}")

# With slash command
@bot.tree.command(
    name="times",
    description="Get times of pray with an URL",
)
async def times(interaction: Interaction, url: str = None):
    try:
        if not url:
            await interaction.response.send_message("You need to provide an URL.")
            return
        times = get_times(url)
        if times:
            times_str = "\n".join([f"- {key} : {value}" for key, value in times.items()])
            await interaction.response.send_message(times_str)
        else:
            await interaction.response.send_message("Error getting times. Check the URL and try again.")
    except Exception as e:
        await interaction.response.send_message("An error occurred. Please try again.")
        print(f"Error: {e}")