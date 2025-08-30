"use client";
import {
    MediaController,
    MediaControlBar,
    MediaVolumeRange,
    MediaPlayButton,
    MediaMuteButton,
} from "media-chrome/react";
import { useWebRTCVideo } from "./video-rtc";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export interface CameraFeedProps {
    /**
     * WebSocket URL for go2rtc stream  (e.g. ws://localhost:5555/websocketVideo)
     */
    wsURL: string;
    /**
     * Optional: Proxy server to forward websocket requests over (e.g. ws://localhost:5555/proxy)
     */
    proxyURL?: string;
    /**
     * Optional: Disable video controls
     */
    disableControls?: boolean;
}

export function Camera({
    wsURL,
    proxyURL,
    disableControls = false,
}: CameraFeedProps) {
    const camera = useWebRTCVideo({
        wsSrc: wsURL,
        ...(proxyURL ? { proxy: proxyURL } : {}),
        retryDelay: 5000, // retry every 5s
        maxRetryAttempts: 10,
        video: { autoPlay: true, muted: true, controls: false, tabIndex: -1 },
    });

    return (
        <MediaController>
            <video slot="media" {...camera.videoProps} />;
            {!disableControls && (
                <MediaControlBar className="flex w-full justify-between px-4 bg-black">
                    <MediaPlayButton className="bg-black px-2 hover:bg-slate-800" />

                    <div className="text-white">
                        <MediaMuteButton className="bg-black p-2 hover:bg-slate-800"></MediaMuteButton>
                        <MediaVolumeRange className="bg-black px-2 hover:bg-slate-800"></MediaVolumeRange>
                    </div>
                </MediaControlBar>
            )}
        </MediaController>
    );
}
