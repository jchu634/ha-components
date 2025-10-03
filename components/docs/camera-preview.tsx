"use client";
import {
    MediaController,
    MediaControlBar,
    MediaPlayButton,
    MediaMuteButton,
    MediaVolumeRange,
    MediaFullscreenButton,
} from "media-chrome/react";
export default function CameraPreview() {
    return (
        <MediaController className="h-fit ">
            <video
                slot="media"
                tabIndex={-1} // This is added for hydration as this is automatically injected
                className="aspect-video"
                src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                autoPlay={true}
            />
            <MediaControlBar className="flex w-full justify-between px-4 bg-black">
                <MediaPlayButton className="bg-black px-2 hover:bg-slate-800" />

                <div className="text-white">
                    <MediaMuteButton className="bg-black p-2 hover:bg-slate-800"></MediaMuteButton>
                    <MediaVolumeRange className="bg-black px-2 hover:bg-slate-800"></MediaVolumeRange>
                    <MediaFullscreenButton className="bg-black px-2 h-full hover:bg-slate-800"></MediaFullscreenButton>
                </div>
            </MediaControlBar>
        </MediaController>
    );
}
