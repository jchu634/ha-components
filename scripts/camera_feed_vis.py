import requests
from dotenv import dotenv_values
import webview

config = dotenv_values(".env")
headers = {
    "Authorization": f"Bearer {config['TOKEN']}",
}
print(headers)

endpoints = ["/api/config", "/api/services", "/api/states"]
for suffix in endpoints:
    response = requests.request(
        "GET", f"{config['NEXT_PUBLIC_HA_URL']}:{config['NEXT_PUBLIC_HA_PORT']}" + suffix, headers=headers)
    print(response.text)
