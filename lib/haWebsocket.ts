import {
    refreshAccessToken,
    // getAccessToken,
    clearTokens,
    login,
} from "./haAuth";
class HAWebSocket {
    private ws: WebSocket | null = null;
    private msgId = 1;
    private handlers: Map<number, (msg: any) => void> = new Map();
    private entitySubscribers: Map<string, Set<(state: any | null) => void>> =
        new Map();

    private refreshTimer: NodeJS.Timeout | null = null;

    async connect(
        baseUrl: string,
        token: string,
        useProxy: boolean = false
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const HA_HOST = process.env.NEXT_PUBLIC_HA_URL;
            const HA_PORT = process.env.NEXT_PUBLIC_HA_PORT;
            const haWsUrl = `ws://${HA_HOST}:${HA_PORT}/api/websocket`;

            const fullUrl = useProxy ? `${baseUrl}/ha` : haWsUrl;

            this.ws = new WebSocket(fullUrl);

            this.ws.onopen = () => console.log("WS connected");

            this.ws.onmessage = async (event) => {
                const msg = JSON.parse(event.data);

                if (msg.type === "auth_required") {
                    this.ws?.send(
                        JSON.stringify({ type: "auth", access_token: token })
                    );
                } else if (msg.type === "auth_ok") {
                    console.log("WS authenticated");
                    this.startRefreshTimer(baseUrl, useProxy);
                    resolve();
                } else if (msg.type === "auth_invalid") {
                    console.warn("Token invalid, trying refresh...");
                    try {
                        const newTokens = await refreshAccessToken();
                        const newToken = newTokens.access_token;
                        console.log("Got new token, reconnecting...");
                        this.connect(baseUrl, newToken, useProxy)
                            .then(resolve)
                            .catch(reject);
                    } catch (err) {
                        console.error(
                            "Refresh failed, clearing tokens and restarting auth"
                        );
                        clearTokens();
                        login(); // restart OAuth2 flow
                        reject(err);
                    }
                }
            };

            this.ws.onerror = (err) => reject(err);
        });
    }

    private startRefreshTimer(baseUrl: string, useProxy: boolean) {
        if (this.refreshTimer) clearTimeout(this.refreshTimer);

        // Refresh 5 minutes before expiry
        const tokens = JSON.parse(localStorage.getItem("ha_tokens") || "{}");
        if (tokens?.expires_in) {
            const refreshIn = tokens.expires_in * 1000 - 5 * 60 * 1000;
            this.refreshTimer = setTimeout(async () => {
                try {
                    const newTokens = await refreshAccessToken();
                    const newToken = newTokens.access_token;
                    console.log(
                        "Background refresh successful, reconnecting WS..."
                    );
                    this.connect(baseUrl, newToken, useProxy);
                } catch (err) {
                    console.error("Background refresh failed, restarting auth");
                    clearTokens();
                    login();
                }
            }, refreshIn);
        }
    }

    callService(domain: string, service: string, serviceData: any) {
        return new Promise((resolve) => {
            const id = this.msgId++;
            this.handlers.set(id, resolve);
            this.ws?.send(
                JSON.stringify({
                    id,
                    type: "call_service",
                    domain,
                    service,
                    service_data: serviceData,
                })
            );
        });
    }

    subscribeEntity(entityId: string, cb: (state: any | null) => void) {
        if (!this.entitySubscribers.has(entityId)) {
            this.entitySubscribers.set(entityId, new Set());
        }
        this.entitySubscribers.get(entityId)?.add(cb);

        // Return unsubscribe function
        return () => {
            this.entitySubscribers.get(entityId)?.delete(cb);
        };
    }
}

export const haWebSocket = new HAWebSocket();
