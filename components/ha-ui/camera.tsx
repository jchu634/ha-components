"use client";
import {
    MediaController,
    MediaControlBar,
    MediaVolumeRange,
    MediaPlayButton,
    MediaMuteButton,
} from "media-chrome/react";
import { useWebRTCVideo } from "./video-rtc";
import type { EntityId } from "@/types/entity-types";

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
}

export function Camera({
    entity,
    wsURL,
    proxyURL,
    disableControls = false,
    aspectRatio = "16/9",
}: CameraFeedProps) {
    const camera = useWebRTCVideo({
        wsSrc: wsURL || `ws://homeassistant.local:11984/api/ws?src=${entity}`,
        ...(proxyURL ? { proxy: proxyURL } : {}),
        retryDelay: 5000, // retry every 5s
        maxRetryAttempts: 10,
        video: { autoPlay: true, muted: true, controls: false, tabIndex: -1 },
    });

    const aspectRatioMap: Record<AspectRatio, string> = {
        "1/1": "aspect-square",
        "16/9": "aspect-video",
        "4/3": "aspect-[4/3]",
    };

    return (
        <MediaController className="h-full">
            <video
                slot="media"
                {...camera.videoProps}
                className={aspectRatioMap[aspectRatio]}
            />

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
