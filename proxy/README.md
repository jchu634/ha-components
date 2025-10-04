## Python Proxy Server
A Python websocket proxy server.
### Installation
If you are using `uv` simply run
```bash
uv run uvicorn proxy_server:app --host 0.0.0.0 --port 8080
```
Otherwise using standard python
```bash
pip install -r requirements.txt
python -m uvicorn proxy_server:app --host 0.0.0.0 --port 8080
```
