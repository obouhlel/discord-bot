import requests
import json
import re
from datetime import datetime

def get_times(url: str) -> dict:
    response = requests.get(url)
    if response.status_code == 200:
        times = re.search(r'"times":(\[.+?\]),', response.text).group(1)
        times = json.loads(times)
        if times:
            if len(times) == 5:
                time_dict = {
                    "Fajr": datetime.strptime(times[0]),
                    "Dhuhr": datetime.strptime(times[1]),
                    "Asr": datetime.strptime(times[2]),
                    "Maghrib": datetime.strptime(times[3]),
                    "Isha": datetime.strptime(times[4])
                }
            else:
                return None
            now = datetime.now()
            current_time = datetime.strptime(now.strftime("%H:%M"), "%H:%M")
            for key, value in time_dict.items():
                if value > current_time:
                    time_dict[key] = f"**{value}**"
                    break
            return time_dict
        else:
            return None
    return None