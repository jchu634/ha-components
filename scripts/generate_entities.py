import asyncio
import websockets
import logging
from dotenv import dotenv_values
import json

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.INFO)


config = dotenv_values(".env")
websocket = websockets


async def fetchEntitiesWebsocket():
    url = f"ws://{config["HA_URL"]}/api/websocket"
    async with websockets.connect(url) as remote:
        logging.info(await remote.recv())  # Auth Request
        auth_msg = {
            "type": "auth",
            "access_token": config["AUTH_TOKEN"]
        }

        await remote.send(json.dumps(auth_msg))
        ack_msg = await remote.recv()
        logging.info(ack_msg)

        get_states_msg = {"id": 1, "type": "get_states"}
        await remote.send(json.dumps(get_states_msg))

        msg = await remote.recv()
        entities = json.loads(msg)
        logging.info("Entities received")

        if entities.get("type") == "result" and entities.get("success"):
            filtered = [
                {
                    "entity_id": e["entity_id"],
                    "friendly_name": e.get("attributes", {}).get("friendly_name"),
                }
                for e in entities["result"]
            ]

            # Build TypeScript union with JSDoc comments
            ts_lines = []
            for e in filtered:
                friendly = e["friendly_name"] or e["entity_id"]
                ts_lines.append(f'  /**\n   * {friendly}\n   */\n  | "{e["entity_id"]}"')

            ts_content = f"""// AUTO-GENERATED FILE - DO NOT EDIT
export type EntityId =
{chr(10).join(ts_lines)};

export interface HAEntity {{
  entity_id: EntityId;
  friendly_name?: string;
}}
"""

            with open("entity-types.ts", "w") as f:
                f.write(ts_content)

            logging.info("Generated entity-types.ts")
        else:
            logging.error("Failed to fetch entities")


if __name__ == "__main__":
    asyncio.run(fetchEntitiesWebsocket())
