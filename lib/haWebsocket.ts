// haWebSocket.ts
type StateChangedEvent = {
    entity_id: string;
    new_state: any;
    old_state: any;
};

class HAWebSocket {
    private ws: WebSocket | null = null;
    private msgId = 1;
    private handlers: Map<number, (msg: any) => void> = new Map();
    private entitySubscribers: Map<string, Set<(state: any | null) => void>> =
        new Map();

    private connected = false;

    async connect(url: string, token: string) {
        return new Promise<void>((resolve, reject) => {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => console.log("WS connected");

            this.ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);

                if (msg.type === "auth_required") {
                    this.ws?.send(
                        JSON.stringify({ type: "auth", access_token: token })
                    );
                } else if (msg.type === "auth_ok") {
                    console.log("WS authenticated");
                    this.connected = true;

                    // Subscribe globally to state_changed events
                    const id = this.msgId++;
                    this.ws?.send(
                        JSON.stringify({
                            id,
                            type: "subscribe_events",
                            event_type: "state_changed",
                        })
                    );

                    resolve();
                } else if (
                    msg.type === "event" &&
                    msg.event?.event_type === "state_changed"
                ) {
                    const ev: StateChangedEvent = msg.event.data;
                    const subs = this.entitySubscribers.get(ev.entity_id);
                    if (subs) {
                        subs.forEach((cb) => cb(ev.new_state));
                    }
                } else if (msg.type === "result") {
                    const handler = this.handlers.get(msg.id);
                    if (handler) {
                        handler(msg);
                        this.handlers.delete(msg.id);
                    }
                }
            };

            this.ws.onerror = (err) => reject(err);
        });
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
