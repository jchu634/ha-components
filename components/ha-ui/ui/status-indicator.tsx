"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface StatusIndicatorProps {
    status: ConnectionStatus;
    error?: Error | null;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function StatusIndicator({ status, error }: StatusIndicatorProps) {
    const statusConfig = {
        connecting: { color: "bg-yellow-500", text: "Connecting..." },
        connected: { color: "bg-green-500", text: "Connected" },
        disconnected: { color: "bg-orange-500", text: "Disconnected" },
        error: { color: "bg-red-500", text: error?.message || "Connection error" },
    };

    const config = statusConfig[status];

    return (
        <Tooltip>
            <TooltipTrigger>
                <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${config.color} cursor-help`} />
            </TooltipTrigger>
            <TooltipContent>
                <p>{config.text}</p>
            </TooltipContent>
        </Tooltip>
    );
}
