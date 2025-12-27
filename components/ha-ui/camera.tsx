"use client";
import { useEffect, useRef } from "react";
import {
    MediaController,
    MediaControlBar,
    MediaVolumeRange,
    MediaPlayButton,
    MediaMuteButton,
    MediaFullscreenButton,
} from "media-chrome/react";
import { ENV } from "@/lib/haAuth";
import { useWebRTC, type WebRTCConnection } from "@/lib/video-rtc";
import { StatusIndicator } from "@/components/ha-ui/ui/status-indicator";
import { RetryButton } from "@/components/ha-ui/ui/retry-button";
import type { EntityId } from "@/types/entity-types";
import { cn } from "@/lib/utils";

type AspectRatio = "1/1" | "4/3" | "16/9";

export interface CameraFeedProps {
    /**
     * HomeAssistant Entity Name, used to generate Websocket URL for go2rtc stream
     */
    entity: EntityId;
    /**
     * Optional: Explicit WebSocket override URL (e.g. ws://localhost:5555/websocketVideo)
     */
    wsURL?: string;
    /**
     * Optional: Proxy server to forward websocket requests over (e.g. ws://localhost:5555/proxy)
     * (Default: None)
     */
    proxyURL?: string;
    /**
     * Optional: Disable video controls
     * (Default: False)
     */
    disableControls?: boolean;
    /**
     * Optional: Aspect Ratio for component to follow,
     * Will Letterbox to meet ratio
     * (Default: 16/9)
     * */
    aspectRatio?: AspectRatio;
    /**
     * Optional: Camera Source override
     * Will ignore entity, wsURL and proxyURl args.
     */
    externalCameraSource?: WebRTCConnection;
}

export function Camera({
    entity,
    wsURL,
    proxyURL,
    externalCameraSource,
    disableControls = false,
    aspectRatio = "16/9",
}: CameraFeedProps) {
    const webRTC = useWebRTC({
        wsSrc: wsURL || `ws://${ENV.HA_HOST}:11984/api/ws?src=${entity}`,
        proxy: proxyURL,
        media: "video,audio",
        enabled: !externalCameraSource,
        autoReconnect: true,
        retryDelay: 5000,
        maxReconnectAttempts: 5,
    });

    // Use external source if provided, otherwise use hook's stream
    const mediaStream = externalCameraSource?.mediaStream || webRTC.mediaStream;
    const status = externalCameraSource ? "connected" : webRTC.status;
    const error = externalCameraSource ? null : webRTC.error;

    const videoRef = useRef<HTMLVideoElement>(null);

    // Attach stream to video element
    useEffect(() => {
        if (mediaStream && videoRef.current) {
            videoRef.current.srcObject = mediaStream;
        } else if (!mediaStream && videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [mediaStream]);

    const aspectRatioMap: Record<AspectRatio, string> = {
        "1/1": "aspect-square",
        "16/9": "aspect-video",
        "4/3": "aspect-[4/3]",
    };

    return (
        <MediaController className={cn("w-full", aspectRatioMap[aspectRatio])}>
            <div className="relative h-full bg-black">
                {/* Video Element */}
                <video
                    slot="media"
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    controls={false}
                    className={aspectRatioMap[aspectRatio]}
                />

                {/* Status Indicator (top right) */}
                {!externalCameraSource && <StatusIndicator status={status} error={error} />}

                {/* Retry Button (centered overlay) */}
                {!externalCameraSource && (
                    <RetryButton onRetry={webRTC.retry} status={status} error={error} autoReconnect={true} />
                )}
            </div>

            {!disableControls && (
                <MediaControlBar className="flex w-full justify-between bg-black px-4">
                    <MediaPlayButton className="bg-black px-2 hover:bg-slate-800" />

                    <div className="text-white">
                        <MediaMuteButton className="bg-black p-2 hover:bg-slate-800"></MediaMuteButton>
                        <MediaVolumeRange className="bg-black px-2 hover:bg-slate-800"></MediaVolumeRange>
                        <MediaFullscreenButton className="h-full bg-black px-2 hover:bg-slate-800"></MediaFullscreenButton>
                    </div>
                </MediaControlBar>
            )}
        </MediaController>
    );
}
