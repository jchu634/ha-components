import { useEffect, useRef, useState, useCallback } from "react";

export type WebRTCMode = "webrtc" | "none";

export interface UseWebRTCVideoOptions {
    /**
     * WebSocket URL for go2rtc stream  (e.g. ws://localhost:5555/websocketVideo)
     */
    wsSrc: string;
    /**
     * Optional Proxy server to forward websocket requests over (e.g. ws://localhost:5555/proxy)
     */
    proxy?: string;
    media?: string; // "video,audio" or "video" or "audio"
    /**
     *  Delay before retrying request (ms, default 5000)
     */
    retryDelay?: number;
    /**
     * Time to wait before timing out connection request (ms, default 10000, -1 disables)
     */
    connectionTimeout?: number;
    /**
     * Number of tries to re-attempt connection (default 5, -1 = infinite)
     */
    maxRetryAttempts?: number;
    onModeChange?: (mode: WebRTCMode) => void;
    onError?: (err: Error) => void;

    // Inline <video> props
    video?: React.VideoHTMLAttributes<HTMLVideoElement>;
}

export interface WebRTCVideo {
    videoProps: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> &
        React.RefAttributes<HTMLVideoElement>;
    connectionMode: WebRTCMode;
    error: Error | null;
    retryCount: number;
    /**
     * The MediaStream received from the remote peer (if available).
     * Exposed so callers can directly assign it to another video element
     * (e.g. to instantly switch displayed feed without a new WebRTC negotiation).
     */
    mediaStream: MediaStream | null;
}

const DEFAULT_PEERCONNECTION_CONFIG: RTCConfiguration = {
    bundlePolicy: "max-bundle",
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTCVideo({
    wsSrc,
    proxy,
    media = "video,audio",
    retryDelay = 5000,
    connectionTimeout = 10000,
    maxRetryAttempts = 5,
    onModeChange,
    onError,
    video = {},
}: UseWebRTCVideoOptions): WebRTCVideo {
    const [connectionMode, setConnectionMode] = useState<WebRTCMode>("none");
    const [error, setError] = useState<Error | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const retryTimer = useRef<number | null>(null);
    const timeoutTimer = useRef<number | null>(null);

    const updateMode = (m: WebRTCMode) => {
        setConnectionMode(m);
        onModeChange?.(m);
    };

    const fail = (err: Error) => {
        console.error("[useWebRTCVideo] error:", err);
        setError(err);
        onError?.(err);
    };

    const cleanup = useCallback(() => {
        if (retryTimer.current) {
            clearTimeout(retryTimer.current);
            retryTimer.current = null;
        }
        if (timeoutTimer.current) {
            clearTimeout(timeoutTimer.current);
            timeoutTimer.current = null;
        }
        if (wsRef.current) {
            try {
                wsRef.current.close();
            } catch {
                /* ignore */
            }
            wsRef.current = null;
        }
        if (peerConnectionRef.current) {
            try {
                peerConnectionRef.current.close();
            } catch {
                /* ignore */
            }
            peerConnectionRef.current = null;
        }
        // clear the exposed media stream reference so consumers know the stream is gone
        setMediaStream(null);
    }, []);

    const scheduleRetry = useCallback(() => {
        if (maxRetryAttempts !== -1 && retryCount >= maxRetryAttempts) {
            fail(new Error("[useWebRTCVideo] Max retry attempts reached, stopping."));
            return;
        }
        if (retryDelay > 0) {
            retryTimer.current = window.setTimeout(() => {
                setRetryCount((c) => c + 1);
                connect();
            }, retryDelay);
        }
    }, [maxRetryAttempts, retryCount, retryDelay]);

    // declare connect separately so scheduleRetry/connect can reference each other
    const connect = useCallback(() => {
        // ensure prior connections are cleaned
        cleanup();

        let wsUrl = wsSrc;
        if (proxy) {
            wsUrl = `${proxy}?target=${encodeURIComponent(wsUrl)}`;
        }

        const ws = new WebSocket(wsUrl);
        ws.binaryType = "arraybuffer";
        wsRef.current = ws;

        ws.addEventListener("open", () => {
            console.log("[useWebRTCVideo] WebSocket open");
            updateMode("webrtc");

            const peerConnection = new RTCPeerConnection(DEFAULT_PEERCONNECTION_CONFIG);
            peerConnectionRef.current = peerConnection;

            // Always add transceivers before creating offer
            if (media.includes("video")) {
                peerConnection.addTransceiver("video", {
                    direction: "recvonly",
                });
            }
            if (media.includes("audio")) {
                peerConnection.addTransceiver("audio", {
                    direction: "recvonly",
                });
            }

            peerConnection.ontrack = (ev) => {
                // prefer to use the exact remote stream object so it can be shared
                const remoteStream =
                    ev.streams && ev.streams.length > 0 ? ev.streams[0] : new MediaStream(ev.track ? [ev.track] : []);
                // assign to video element if present
                if (videoElementRef.current) {
                    // set srcObject to the same MediaStream instance we expose
                    videoElementRef.current.srcObject = remoteStream;
                }
                // expose the stream to the hook consumer
                setMediaStream(remoteStream);

                // clear connection timeout once we get tracks
                if (timeoutTimer.current) {
                    clearTimeout(timeoutTimer.current);
                    timeoutTimer.current = null;
                }
            };

            peerConnection.onconnectionstatechange = () => {
                if (
                    peerConnection.connectionState === "failed" ||
                    peerConnection.connectionState === "disconnected" ||
                    peerConnection.connectionState === "closed"
                ) {
                    console.warn("[useWebRTCVideo] connection failed, retrying...");
                    cleanup();
                    scheduleRetry();
                }
            };

            ws.onmessage = (ev) => {
                try {
                    const msg = JSON.parse(ev.data);
                    if (msg.type === "webrtc/answer") {
                        peerConnection
                            .setRemoteDescription({
                                type: "answer",
                                sdp: msg.value,
                            })
                            .catch(fail);
                    } else if (msg.type === "webrtc/candidate") {
                        peerConnection
                            .addIceCandidate({
                                candidate: msg.value,
                                sdpMid: "0",
                            })
                            .catch(fail);
                    }
                } catch (err) {
                    console.warn("[useWebRTCVideo] failed to parse ws message", err);
                }
            };

            peerConnection
                .createOffer()
                .then((offer) => {
                    return peerConnection.setLocalDescription(offer).then(() => offer);
                })
                .then((offer) => {
                    ws.send(
                        JSON.stringify({
                            type: "webrtc/offer",
                            value: offer.sdp,
                        }),
                    );
                })
                .catch(fail);

            // start connection timeout if enabled
            if (connectionTimeout > 0) {
                timeoutTimer.current = window.setTimeout(() => {
                    console.warn("[useWebRTCVideo] connection timeout, retrying...");
                    cleanup();
                    scheduleRetry();
                }, connectionTimeout);
            }
        });

        ws.addEventListener("close", () => {
            console.warn("[useWebRTCVideo] WebSocket closed, retrying...");
            cleanup();
            scheduleRetry();
        });

        ws.addEventListener("error", () => {
            console.warn("[useWebRTCVideo] WebSocket error, retrying...");
            cleanup();
            scheduleRetry();
        });
    }, [wsSrc, proxy, media, retryDelay, connectionTimeout, maxRetryAttempts, cleanup, scheduleRetry]);

    useEffect(() => {
        setRetryCount(0);
        connect();
        return () => {
            cleanup();
        };
    }, [connect, cleanup]);

    return {
        connectionMode,
        error,
        retryCount,
        mediaStream,
        videoProps: {
            ref: videoElementRef,
            autoPlay: true,
            playsInline: true,
            controls: true,
            ...video, // inline overrides
        },
    };
}
