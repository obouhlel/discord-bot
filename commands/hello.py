from bot_instance import bot
from discord.ext import commands
from discord import Interaction

# With prefix command
@bot.command(
    name="hello",
    description="Say hello to the bot",
)
async def hello(ctx: commands.Context):
    await ctx.send(f"Hello, {ctx.author.mention}!")

# With slash command
@bot.tree.command(
    name="hello",
    description="Say hello to the bot",
)
async def hello(interaction: Interaction):
    await interaction.response.send_message(f"Hello, {interaction.user.mention}!")