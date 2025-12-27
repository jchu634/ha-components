"use client";

import { Button } from "@/components/ui/button";
import type { ConnectionStatus } from "./status-indicator";

export interface RetryButtonProps {
    onRetry: () => void;
    status: ConnectionStatus;
    error?: Error | null;
    autoReconnect?: boolean;
}

export function RetryButton({ onRetry, status, error, autoReconnect = false }: RetryButtonProps) {
    const showButton = status === "error" || (status === "disconnected" && !autoReconnect);

    if (!showButton) return null;

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4 text-white">
                {status === "error" && error && <p className="max-w-md px-4 text-center">{error.message}</p>}
                <Button onClick={onRetry} size="lg" className="min-w-32">
                    Retry Connection
                </Button>
            </div>
        </div>
    );
}
