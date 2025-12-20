"use client";

import { ReactNode, useEffect, useState } from "react";
import { haWebSocket } from "@/lib/haWebsocket";
import { getAccessToken, login, exchangeCodeForToken } from "@/lib/haAuth";

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

    const HA_URL = getImportMetaEnv("VITE_HA_URL") || process.env.NEXT_PUBLIC_HA_URL || process.env.HA_URL;
    const HA_PORT = getImportMetaEnv("VITE_HA_PORT") || process.env.NEXT_PUBLIC_HA_PORT || process.env.HA_PORT;
    const PROXY_URL = getImportMetaEnv("VITE_PROXY_URL") || process.env.NEXT_PUBLIC_PROXY_URL || process.env.PROXY_URL;

    useEffect(() => {
        if (token) return;

        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
            exchangeCodeForToken(code)
                .catch((err) => {
                    console.error("Failed to exchange code for token:", err);
                })
                .then(() => {
                    setToken(getAccessToken());

                    // Clean Code from URL
                    window.history.replaceState({}, "", window.location.pathname);
                });
        } else {
            login(); // redirect to HA OAuth2
        }
    }, []);

    useEffect(() => {
        if (!token) return;

        async function connect() {
            try {
                await haWebSocket.connect(useProxy ? PROXY_URL! : `${HA_URL}:${HA_PORT}`, token!, useProxy);
                setReady(true);
            } catch (err) {
                console.error("Failed to connect to HA WebSocket:", err);
            }
        }

        connect();
    }, [token, useProxy, HA_URL, HA_PORT, PROXY_URL]);

    if (!ready) {
        return <div>Connecting to Home Assistant...</div>;
    }

    return <>{children}</>;
}
