"use client";
import {
    MediaController,
    MediaControlBar,
    MediaTimeRange,
    MediaTimeDisplay,
    MediaVolumeRange,
    MediaPlayButton,
    MediaSeekBackwardButton,
    MediaSeekForwardButton,
    MediaMuteButton,
} from "media-chrome/react";

export function CameraFeed() {
    return (
        <MediaController>
            <video
                slot="media"
                src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"
                preload="auto"
                muted
                crossOrigin=""
                tabIndex={-1}
            />
            <MediaControlBar className="flex w-full justify-between">
                <div>
                    <MediaPlayButton></MediaPlayButton>
                    {/* <MediaTimeRange></MediaTimeRange> */}
                    <MediaTimeDisplay showDuration></MediaTimeDisplay>
                </div>
                <div>
                    <MediaMuteButton></MediaMuteButton>
                    <MediaVolumeRange></MediaVolumeRange>
                </div>
            </MediaControlBar>
            {/* <MediaControlBar>
                <MediaPlayButton></MediaPlayButton>
                <MediaTimeRange></MediaTimeRange>
                <MediaTimeDisplay showDuration></MediaTimeDisplay>
                <MediaMuteButton></MediaMuteButton>
                <MediaVolumeRange></MediaVolumeRange>
            </MediaControlBar> */}
        </MediaController>
    );
}
