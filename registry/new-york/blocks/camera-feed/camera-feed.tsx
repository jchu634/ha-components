"use client";
import { useRef, useEffect } from "react";
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
import { useWebRTCVideo } from "./video-rtc";

export function CameraFeed() {
    const camera1 = useWebRTCVideo({
        wsSrc: "ws://homeassistant.local:11984/api/ws?src=camera.g4_doorbell_high",
        proxy: "ws://localhost:8080/proxy",
        retryDelay: 5000, // retry every 5s
        video: { autoPlay: true, muted: true, controls: false, tabIndex: -1 },
    });

    return (
        <MediaController>
            <video slot="media" {...camera1.videoProps} />;
            <MediaPlayButton />
        </MediaController>
        // <MediaController>

        //     <MediaControlBar className="flex w-full justify-between">
        //         <div>
        //             <MediaPlayButton></MediaPlayButton>
        //             {/* <MediaTimeRange></MediaTimeRange> */}
        //             <MediaTimeDisplay showDuration></MediaTimeDisplay>
        //         </div>
        //         <div>
        //             <MediaMuteButton></MediaMuteButton>
        //             <MediaVolumeRange></MediaVolumeRange>
        //         </div>
        //     </MediaControlBar>
        //     {/* <MediaControlBar>
        //          <MediaPlayButton></MediaPlayButton>
        //          <MediaTimeRange></MediaTimeRange>
        //          <MediaTimeDisplay showDuration></MediaTimeDisplay>
        //          <MediaMuteButton></MediaMuteButton>
        //          <MediaVolumeRange></MediaVolumeRange>
        //      </MediaControlBar> */}
        // </MediaController>
    );
}
