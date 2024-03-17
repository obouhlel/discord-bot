from bot_instance import bot
from discord.ext import commands
from discord import Interaction
from config import CMDS, PREFIX

# With prefix command
@bot.command(
    name="help",
    description="Help command"
)
async def help(ctx: commands.Context):
    help_text = "\n\n".join(f"- `{cmd['name']}` : {cmd['description']}" for cmd in CMDS)
    await ctx.send(f"\tPrefix is `{PREFIX}`\n\n{help_text}")

# With slash command
@bot.tree.command(
    name="help",
    description="Help command"
)
async def help(interaction: Interaction):
    help_text = "\n\n".join(f"- `{cmd['name']}` : {cmd['description']}" for cmd in CMDS)
    await interaction.response.send_message(help_text)