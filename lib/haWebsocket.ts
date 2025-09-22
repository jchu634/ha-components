import { getAccessToken, refreshAccessToken, clearTokens, login, getTimeToExpiryMs } from "./haAuth";

class HAWebSocket {
    private ws: WebSocket | null = null;
    private msgId = 1;
    private refreshTimer: number | null = null;

    async connect(baseUrl: string, token: string, useProxy: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            const HA_HOST = process.env.NEXT_PUBLIC_HA_URL;
            const HA_PORT = process.env.NEXT_PUBLIC_HA_PORT;
            const haWsUrl = `ws://${HA_HOST}:${HA_PORT}/api/websocket`;

            const fullUrl = useProxy ? `${baseUrl}/ha` : haWsUrl;

            console.log("[HA WS] Connecting:", fullUrl);
            this.ws = new WebSocket(fullUrl);

            this.ws.onopen = () => console.log("[HA WS] Opened");

            this.ws.onmessage = async (event) => {
                const msg = JSON.parse(event.data);

                if (msg.type === "auth_required") {
                    this.ws?.send(JSON.stringify({ type: "auth", access_token: token }));
                } else if (msg.type === "auth_ok") {
                    console.log("[HA WS] Authenticated");
                    this.scheduleRefresh(baseUrl, useProxy);
                    resolve();
                } else if (msg.type === "auth_invalid") {
                    console.warn("[HA WS] auth_invalid, trying refresh");
                    try {
                        const newTokens = await refreshAccessToken();
                        const newToken = newTokens.access_token;
                        console.log("[HA WS] Token refreshed, retrying connect");
                        await this.reconnect(baseUrl, newToken, useProxy);
                        resolve();
                    } catch (err) {
                        console.error("[HA WS] Refresh failed; clearing tokens and restarting login");
                        clearTokens();
                        login();
                        reject(err);
                    }
                }
            };

            this.ws.onerror = (err) => {
                console.error("[HA WS] WebSocket error:", err);
                reject(err);
            };

            this.ws.onclose = () => {
                console.warn("[HA WS] Closed");
                this.clearTimers();
            };
        });
    }

    private async reconnect(baseUrl: string, token: string, useProxy: boolean) {
        this.clearTimers();
        try {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close();
        } catch {}
        return this.connect(baseUrl, token, useProxy);
    }

    private scheduleRefresh(baseUrl: string, useProxy: boolean) {
        this.clearRefreshTimer();
        const tte = getTimeToExpiryMs();
        if (tte == null) {
            console.log("[HA WS] Token has no expiry; skipping proactive refresh (likely long-lived)");
            return;
        }
        const refreshIn = Math.max(tte - 5 * 60 * 1000, 10 * 1000); // 5 min before expiry, at least 10s
        console.log("[HA WS] Scheduling refresh in", Math.round(refreshIn / 1000), "s");
        this.refreshTimer = window.setTimeout(async () => {
            try {
                const newTokens = await refreshAccessToken();
                const newToken = newTokens.access_token;
                console.log("[HA WS] Proactive refresh OK; reconnecting WS");
                await this.reconnect(baseUrl, newToken, useProxy);
            } catch (e) {
                console.error("[HA WS] Proactive refresh failed; restarting auth");
                clearTokens();
                login();
            }
        }, refreshIn);
    }

    private clearRefreshTimer() {
        if (this.refreshTimer) window.clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
    }

    private clearTimers() {
        this.clearRefreshTimer();
    }

    callService(domain: string, service: string, serviceData: any) {
        const id = ++this.msgId;
        this.ws?.send(
            JSON.stringify({
                id,
                type: "call_service",
                domain,
                service,
                service_data: serviceData,
            })
        );
    }
}

export const haWebSocket = new HAWebSocket();
