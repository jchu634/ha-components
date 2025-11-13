"use client";

import {
    MediaController,
    MediaControlBar,
    MediaPlayButton,
    MediaMuteButton,
    MediaVolumeRange,
    MediaFullscreenButton,
} from "media-chrome/react";

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
    autoPlay = false,
}: CameraPreviewProps) {
    return (
        <MediaController className="h-fit w-full">
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
            <MediaControlBar className="flex w-full justify-between bg-black px-4">
                <MediaPlayButton className="bg-black px-2 hover:bg-slate-800" />
                <div className="flex items-center text-white">
                    <MediaMuteButton className="bg-black p-2 hover:bg-slate-800" />
                    <MediaVolumeRange className="bg-black px-2 hover:bg-slate-800" />
                    <MediaFullscreenButton className="bg-black px-2 hover:bg-slate-800" />
                </div>
            </MediaControlBar>
        </MediaController>
    );
}
