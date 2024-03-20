from bot_instance import bot
from utils import *
from discord.ext import commands
from discord import Interaction
from config import pray_times

# With prefix command
@bot.command(
    name="times_city",
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
async def times_city(ctx: commands.Context, city: str = None):
    try:
        if not city:
            await ctx.send("You need to provide a city.")
            return
        times = pray_times.get(city)
        if not times:
            await ctx.send("Error getting times. Check the city and try again.")
            return
        times_str = pray_time_dict_to_str(found_next_time_to_pray(times))
        await ctx.send(times_str)
    except Exception as e:
        await ctx.send("An error occurred. Please try again.")
        print(f"Error: {e}")

# With slash command
@bot.tree.command(
    name="times_city",
    description="Get times of pray with an city",
)
async def times_city(interaction: Interaction, city: str = None):
    try:
        if not city:
            await interaction.response.send_message("You need to provide a city.")
            return
        times = pray_times.get(city)
        if not times:
            await interaction.response.send_message("Error getting times. Check the city and try again.")
            return
        times_str = pray_time_dict_to_str(found_next_time_to_pray(times))
        await interaction.response.send_message(times_str)
    except Exception as e:
        await interaction.response.send_message("An error occurred. Please try again.")
        print(f"Error: {e}")