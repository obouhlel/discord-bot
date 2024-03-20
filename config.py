from dotenv import load_dotenv
from utils import get_times
import os

load_dotenv()
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
APP_ID = int(os.getenv('APP_ID'))
PERMISSION = int(os.getenv('PERMISSION'))

INVITE_LINK = f"https://discord.com/api/oauth2/authorize?client_id={APP_ID}&permissions={PERMISSION}&scope=applications.commands+bot"

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
    {
        "name": "times_url",
        "description": "Need to give an url of Mawaqit website to get the times of pray",
    },
    {
        "name": "times_city",
        "description": "Need to give a city to get the times of pray",
    },
    {
        "name": "play",
        "description": "Play a sound",
    }
]

mawaqit_url = {
    "Goussainville": "https://mawaqit.net/fr/mosquee-goussainville",
    "Merignac": "https://mawaqit.net/fr/m/mosquee-essalam-merignac",
}

pray_times = {
    "Goussainville": get_times(mawaqit_url["Goussainville"]),
    "Merignac": get_times(mawaqit_url["Merignac"]),
}