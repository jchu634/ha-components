"use client";

import {
    MediaController,
    MediaControlBar,
    MediaPlayButton,
    MediaMuteButton,
    MediaVolumeRange,
    MediaFullscreenButton,
} from "media-chrome/react";
import { StatusIndicator } from "@/components/ha-ui/ui/status-indicator";

export interface CameraPreviewProps {
    /**
     * Fixed or public video source URL (default demo clip)
     */
    src?: string;

    /**
     * Enable autoplay (default: false)
     */
    autoPlay?: boolean;
}

export default function CameraPreview({
    src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    autoPlay = true,
}: CameraPreviewProps) {
    return (
        <MediaController className="group aspect-video w-full">
            <video
                slot="media"
                tabIndex={-1} // This is added for hydration as this is automatically injected
                className="aspect-video object-cover"
                autoPlay={autoPlay}
                muted
                playsInline
                src={src}
                controls={false}
            />
            <StatusIndicator status={"connected"} />

            <MediaControlBar className="relative flex w-full justify-between bg-black px-4 transition-opacity duration-200 md:absolute md:right-0 md:bottom-0 md:left-0 md:z-10 md:opacity-0 md:group-hover:opacity-100">
                <MediaPlayButton className="bg-black px-2 hover:bg-slate-800" />

                <div className="text-white">
                    <MediaMuteButton className="bg-black p-2 hover:bg-slate-800"></MediaMuteButton>
                    <MediaVolumeRange className="bg-black px-2 hover:bg-slate-800"></MediaVolumeRange>
                    <MediaFullscreenButton className="h-full bg-black px-2 hover:bg-slate-800"></MediaFullscreenButton>
                </div>
            </MediaControlBar>
        </MediaController>
    );
}
