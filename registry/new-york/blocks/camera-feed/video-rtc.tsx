import { useEffect, useRef, useState, useCallback } from "react";

export type VideoRTCMode = "webrtc" | "mse" | "hls" | "mp4" | "mjpeg" | "none";

export interface UseVideoRTCOptions {
    wsSrc: string; // REQUIRED: WebSocket signaling URL
    proxy?: string; // OPTIONAL: proxy server URL (ws://localhost:8080/proxy)
    mode?: string; // "webrtc,mse,hls,mp4,mjpeg"
    media?: string; // "video,audio"
    forceFallback?: boolean; // skip WebRTC and go straight to fallback
    onModeChange?: (mode: VideoRTCMode) => void;
    onError?: (err: Error) => void;
}

export interface UseVideoRTCResult {
    src: string | null;
    srcObject: MediaStream | null;
    connectionMode: VideoRTCMode;
    error: Error | null;
}

const DEFAULT_PC_CONFIG: RTCConfiguration = {
    bundlePolicy: "max-bundle",
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    // sdpSemantics: "unified-plan",
};

export function useVideoRTC({
    wsSrc,
    proxy,
    mode = "webrtc,mse,hls,mp4,mjpeg",
    media = "video,audio",
    forceFallback = false,
    onModeChange,
    onError,
}: UseVideoRTCOptions): UseVideoRTCResult {
    const [src, setSrc] = useState<string | null>(null);
    const [srcObject, setSrcObject] = useState<MediaStream | null>(null);
    const [connectionMode, setConnectionMode] = useState<VideoRTCMode>("none");
    const [error, setError] = useState<Error | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    streamRef.current = srcObject;

    const attachRef = useCallback((el: HTMLVideoElement | null) => {
        if (el && streamRef.current) {
            el.srcObject = streamRef.current;
        }
    }, []);

    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    const updateMode = (m: VideoRTCMode) => {
        setConnectionMode(m);
        onModeChange?.(m);
    };

    const fail = (err: Error) => {
        console.error("[useVideoRTC] error:", err);
        setError(err);
        onError?.(err);
    };

    // --- Utility ---
    const codecs = (isSupported: (type: string) => boolean) => {
        const CODECS = [
            "avc1.640029",
            "avc1.64002A",
            "avc1.640033",
            "hvc1.1.6.L153.B0",
            "mp4a.40.2",
            "mp4a.40.5",
            "flac",
            "opus",
        ];
        return CODECS.filter((codec) =>
            isSupported(`video/mp4; codecs="${codec}"`)
        ).join();
    };

    const createOffer = async (pc: RTCPeerConnection) => {
        try {
            if (media.includes("microphone")) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                stream.getTracks().forEach((track) => {
                    pc.addTransceiver(track, { direction: "sendonly" });
                });
            }
        } catch (e) {
            console.warn(e);
        }
        for (const kind of ["video", "audio"]) {
            if (media.includes(kind)) {
                pc.addTransceiver(kind, { direction: "recvonly" });
            }
        }
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        return offer;
    };

    const btoaBytes = (bytes: Uint8Array) => {
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    // --- Negotiation Handlers ---
    const handleWebRTC = (ws: WebSocket, onFail: () => void) => {
        updateMode("webrtc");
        const pc = new RTCPeerConnection(DEFAULT_PC_CONFIG);
        pcRef.current = pc;

        pc.ontrack = (ev) => {
            setSrcObject(new MediaStream(ev.streams[0].getTracks()));
        };

        pc.onconnectionstatechange = () => {
            if (
                pc.connectionState === "failed" ||
                pc.connectionState === "disconnected"
            ) {
                pc.close();
                pcRef.current = null;
                onFail();
            }
        };

        ws.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.type === "webrtc/answer") {
                pc.setRemoteDescription({
                    type: "answer",
                    sdp: msg.value,
                }).catch(fail);
            } else if (msg.type === "webrtc/candidate") {
                pc.addIceCandidate({ candidate: msg.value, sdpMid: "0" }).catch(
                    fail
                );
            }
        };

        createOffer(pc).then((offer) => {
            ws.send(JSON.stringify({ type: "webrtc/offer", value: offer.sdp }));
        });
    };

    const handleHLS = (ws: WebSocket) => {
        updateMode("hls");
        ws.send(JSON.stringify({ type: "hls" }));
        ws.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.type === "hls") {
                setSrc(
                    "data:application/vnd.apple.mpegurl;base64," +
                        btoa(msg.value)
                );
            }
        };
    };

    const handleMP4 = (ws: WebSocket) => {
        updateMode("mp4");
        ws.send(JSON.stringify({ type: "mp4" }));
        ws.onmessage = (ev) => {
            if (ev.data instanceof ArrayBuffer) {
                setSrc(
                    "data:video/mp4;base64," +
                        btoaBytes(new Uint8Array(ev.data))
                );
            }
        };
    };

    const handleMJPEG = (ws: WebSocket) => {
        updateMode("mjpeg");
        ws.send(JSON.stringify({ type: "mjpeg" }));
        ws.onmessage = (ev) => {
            if (ev.data instanceof ArrayBuffer) {
                setSrc(
                    "data:image/jpeg;base64," +
                        btoaBytes(new Uint8Array(ev.data))
                );
            }
        };
    };

    // --- Lifecycle ---
    useEffect(() => {
        if (!wsSrc) return;

        let wsUrl = wsSrc;
        if (proxy) {
            wsUrl = `${proxy}?target=${encodeURIComponent(wsUrl)}`;
        }

        const ws = new WebSocket(wsUrl);
        ws.binaryType = "arraybuffer";
        wsRef.current = ws;

        ws.addEventListener("open", () => {
            console.log("[useVideoRTC] WebSocket open");

            const tryFallback = () => {
                if (mode.includes("hls")) {
                    handleHLS(ws);
                } else if (mode.includes("mp4")) {
                    handleMP4(ws);
                } else if (mode.includes("mjpeg")) {
                    handleMJPEG(ws);
                } else {
                    updateMode("none");
                }
            };

            if (
                !forceFallback &&
                mode.includes("webrtc") &&
                "RTCPeerConnection" in window
            ) {
                handleWebRTC(ws, tryFallback);
            } else {
                tryFallback();
            }
        });

        ws.addEventListener("error", (e) => {
            fail(new Error("WebSocket error"));
        });

        return () => {
            ws.close();
            wsRef.current = null;
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }
        };
    }, [wsSrc, proxy, mode, forceFallback]);

    return { src, srcObject, connectionMode, error };
}
