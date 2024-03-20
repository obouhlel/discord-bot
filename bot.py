from bot_instance import bot
from config import DISCORD_TOKEN, INVITE_LINK, pray_times, mawaqit_url
from commands import *
from events import *

def main():
    print(f"Invite link: {INVITE_LINK}")
    print(f"Pray times: {pray_times}")
    print(f"Mawaqit url: {mawaqit_url}")
    bot.run(DISCORD_TOKEN)

if __name__ == "__main__":
    main()