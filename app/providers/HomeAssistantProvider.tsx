// app/providers/HomeAssistantProvider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { haWebSocket } from "@/lib/haWebsocket";

export function HomeAssistantProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function connect() {
            try {
                await haWebSocket.connect(
                    `ws://${process.env.NEXT_PUBLIC_HA_URL}/api/websocket`,
                    process.env.NEXT_PUBLIC_DEBUG_TOKEN!
                );
                setReady(true);
            } catch (err) {
                console.error("Failed to connect to HA WebSocket:", err);
            }
        }

        connect();
    }, []);

    if (!ready) {
        return <div>Connecting to Home Assistant...</div>;
    }

    return <>{children}</>;
}
