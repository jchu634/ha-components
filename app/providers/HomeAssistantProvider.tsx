"use client";

import { ReactNode, useEffect, useState } from "react";
import { haWebSocket } from "@/lib/haWebsocket";
import { getAccessToken, login } from "@/lib/haAuth";

export function HomeAssistantProvider({ children, useProxy = false }: { children: ReactNode; useProxy?: boolean }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let token = getAccessToken();
        if (!token) {
            login(); // redirect to HA login
            return;
        }

        async function connect() {
            try {
                await haWebSocket.connect(
                    useProxy
                        ? process.env.NEXT_PUBLIC_PROXY_URL!
                        : `${process.env.NEXT_PUBLIC_HA_URL}:${process.env.NEXT_PUBLIC_HA_PORT}`,
                    token!,
                    useProxy,
                );
                setReady(true);
            } catch (err) {
                console.error("Failed to connect to HA WebSocket:", err);
            }
        }

        connect();
    }, [useProxy]);

    if (!ready) {
        return <div>Connecting to Home Assistant...</div>;
    }

    return <>{children}</>;
}
