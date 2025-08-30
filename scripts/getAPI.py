import requests
from dotenv import dotenv_values

config = dotenv_values(".env")
headers = {
    "Authorization": f"Bearer {config['TOKEN']}",
}
print(headers)

endpoints = ["/api/config", "/api/services", "/api/states"]
for suffix in endpoints:
    response = requests.request("GET", config['URL'] + suffix, headers=headers)
    print(response.text)