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
import { useVideoRTC } from "./video-rtc";

export function CameraFeed() {
    const { src, srcObject, connectionMode } = useVideoRTC({
        wsSrc: "ws://homeassistant.local:11984/api/ws?src=camera.g4_doorbell_high",
        proxy: "ws://localhost:8080/proxy",
        onModeChange: (m) => console.log("Mode:", m),
        onError: (err) => console.error("RTC error:", err),
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current && srcObject) {
            videoRef.current.srcObject = srcObject;
        }
    }, [srcObject]);

    return (
        <MediaController>
            <video
                ref={videoRef}
                slot="media"
                autoPlay
                playsInline
                src={src ?? undefined}
                tabIndex={-1}
            />

            <MediaPlayButton />
        </MediaController>
        // <MediaController>
        //     {/* <video
        //         slot="media"
        //         src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"
        //         preload="auto"
        //         muted
        //         crossOrigin=""
        //         tabIndex={-1}
        //     /> */}
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
