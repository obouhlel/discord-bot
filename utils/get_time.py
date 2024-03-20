import requests
import json
import re
from datetime import datetime

def get_times(url: str) -> dict:
    response = requests.get(url)
    if not response.status_code == 200:
        return None
    times = re.search(r'"times":(\[.+?\]),', response.text).group(1)
    times = json.loads(times)
    if not times and len(times) == 5:
        return None
    time_dict = {
        "Fajr": datetime.strptime(times[0], "%H:%M").strftime("%H:%M"),
        "Dhuhr": datetime.strptime(times[1], "%H:%M").strftime("%H:%M"),
        "Asr": datetime.strptime(times[2], "%H:%M").strftime("%H:%M"),
        "Maghrib": datetime.strptime(times[3], "%H:%M").strftime("%H:%M"),
        "Isha": datetime.strptime(times[4], "%H:%M").strftime("%H:%M")
    }
    return time_dict

def found_next_time_to_pray(pray_times: dict) -> dict:
    now = datetime.now()
    current_time = datetime.strptime(now.strftime("%H:%M"), "%H:%M").strftime("%H:%M")
    for key, value in pray_times.items():
        if value > current_time:
            pray_times[key] = f"**{value}**"
            break
    return pray_times

def pray_time_dict_to_str(pray_times: dict) -> str:
    times = ""
    for key, value in pray_times.items():
        times += f"- {key}: {value}\n"
    return times