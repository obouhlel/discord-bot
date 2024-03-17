from dotenv import load_dotenv
import os

load_dotenv()
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

PREFIX = '!'

CMDS = [
    {
        "name": "hello",
        "description": "Say hello to the bot",
    },
    {
        "name": "connect",
        "description": "Connect on voice channel",
    },
    {
        "name": "disconnect",
        "description": "Disconnect on voice channel",
    },
]