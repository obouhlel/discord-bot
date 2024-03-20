from bot_instance import bot
from config import DISCORD_TOKEN, INVITE_LINK
from commands import *
from events import *

def main():
    print(f"Invite link: {INVITE_LINK}")
    bot.run(DISCORD_TOKEN)

if __name__ == "__main__":
    main()