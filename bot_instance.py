import discord
from discord.ext import commands
from config import PREFIX

bot = commands.Bot(command_prefix=PREFIX, help_command=None, intents=discord.Intents.all())