"use client";

import { type ReactNode, useEffect, useState } from "react";
import { haWebSocket } from "@/lib/haWebsocket";
import { getAccessToken, login, exchangeCodeForToken, ENV } from "@/lib/haAuth";

function getImportMetaEnv(key: string): string | undefined {
    try {
        // @ts-ignore - import.meta may not exist in Next
        return typeof import.meta !== "undefined" ? import.meta.env?.[key] : undefined;
    } catch {
        return undefined;
    }
}

export function HomeAssistantProvider({ children, useProxy = false }: { children: ReactNode; useProxy?: boolean }) {
    const [ready, setReady] = useState(false);
    const [token, setToken] = useState<string | null>(() => getAccessToken());

    useEffect(() => {
        if (token) return;

        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
            exchangeCodeForToken(code)
                .then(() => {
                    setToken(getAccessToken());
                    // Clean Code from URL
                    window.history.replaceState({}, "", window.location.pathname);
                })
                .catch((err) => {
                    console.error("Failed to exchange code for token:", err);
                });
        } else {
            login(); // redirect to HA OAuth2
        }
    }, []);

    useEffect(() => {
        if (!token) return;
        if (useProxy && !ENV.PROXY_URL) {
            console.error("PROXY_URL is required when useProxy is enabled");
            return;
        }

        async function connect() {
            try {
                await haWebSocket.connect(
                    useProxy ? ENV.PROXY_URL! : `${ENV.HA_HOST}:${ENV.HA_PORT}`,
                    token!,
                    useProxy,
                );
                setReady(true);
            } catch (err) {
                console.error("Failed to connect to HA WebSocket:", err);
            }
        }

        connect();
    }, [token, useProxy]);

    if (!ready) {
        return <div>Connecting to Home Assistant...</div>;
    }

    return <>{children}</>;
}
