from bot_instance import bot

@bot.event
async def on_ready():
    print(f'{bot.user.name} has connected to Discord!')
    try:
        s = await bot.tree.sync()
        print(f"Synced {len(s)} tree successfully!")
    except Exception as e:
        print(f"Error syncing tree: {e}")