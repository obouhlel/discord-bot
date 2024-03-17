from bot_instance import bot
from config import DISCORD_TOKEN
from commands import *
from events import *

def main():
    bot.run(DISCORD_TOKEN)

if __name__ == "__main__":
    main()