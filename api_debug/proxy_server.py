import asyncio
import websockets
from fastapi import FastAPI, WebSocket
from fastapi.responses import FileResponse
from pathlib import Path

# Path to your static files (stream.html, video-stream.js, etc.)
STATIC_DIR = Path(__file__).parent / "public"

app = FastAPI()


@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "stream.html")


@app.get("/{path:path}")
async def static_files(path: str):
    file_path = STATIC_DIR / path
    if file_path.exists():
        return FileResponse(file_path)
    return {"error": "File not found"}


@app.websocket("/proxy")
async def proxy(websocket: WebSocket):
    """
    Browser connects here: ws://localhost:8080/proxy?target=ws://...
    We connect to the target WebSocket without sending Origin.
    """
    await websocket.accept()

    # Extract target from query string
    query = websocket.query_params
    target = query.get("target")
    if not target:
        await websocket.send_text("Missing ?target=ws://...")
        await websocket.close()
        return

    try:
        async with websockets.connect(target) as remote:
            async def client_to_server():
                try:
                    while True:
                        msg = await websocket.receive_text()
                        await remote.send(msg)
                except Exception:
                    pass

            async def server_to_client():
                try:
                    async for msg in remote:
                        await websocket.send_text(msg)
                except Exception:
                    pass

            await asyncio.gather(client_to_server(), server_to_client())

    except Exception as e:
        await websocket.send_text(f"Proxy error: {e}")
        await websocket.close()