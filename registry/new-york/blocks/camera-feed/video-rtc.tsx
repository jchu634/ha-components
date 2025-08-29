import React, { useEffect, useRef, useImperativeHandle } from "react";
import { useMediaRef } from "media-chrome/react/media-store";

export interface VideoRTCProps {
    wsSrc: string; // REQUIRED: WebSocket SRC URL (ws://camera.local/ws")
    src?: string; // OPTIONAL: fallback media source (hls/mp4/mjpeg)
    proxy?: string; // OPTIONAL: proxy server URL (ws://localhost:8080/proxy)
    mode?: string; // "webrtc,mse,hls,mp4,mjpeg"
    media?: string; // "video,audio"
    background?: boolean;
    visibilityThreshold?: number;
    visibilityCheck?: boolean;
    pcConfig?: RTCConfiguration;
    autoPlay?: boolean;
    controls?: boolean;
    style?: React.CSSProperties;
    className?: string;
    forceFallback?: boolean; // skip WebRTC and go straight to fallback
    ref?: React.Ref<VideoRTCHandle>;
    slot?: string;
    onModeChange?: (mode: string) => void; //callback when mode changes
}

export interface VideoRTCHandle {
    play: () => void;
    pause: () => void;
    getVideoElement: () => HTMLVideoElement | null;
    getConnectionMode: () => string;
}

const DEFAULT_PC_CONFIG: RTCConfiguration = {
    bundlePolicy: "max-bundle",
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function VideoRTC({
    wsSrc,
    src,
    proxy,
    mode = "webrtc,mse,hls,mp4,mjpeg",
    media = "video,audio",
    background = false,
    visibilityThreshold = 0,
    visibilityCheck = true,
    pcConfig = DEFAULT_PC_CONFIG,
    autoPlay = true,
    controls = true,
    style,
    className,
    forceFallback = false,
    ref,
    onModeChange,
}: VideoRTCProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    const connectTS = useRef<number>(0);
    const reconnectTID = useRef<number>(0);

    const mseCodecs = useRef<string>("");
    const ondataRef = useRef<((data: ArrayBuffer) => void) | null>(null);
    const onmessageRef = useRef<Record<string, (msg: any) => void>>({});

    const [connectionMode, setConnectionMode] = React.useState<string>("none");

    const updateMode = (newMode: string) => {
        setConnectionMode(newMode);
        onModeChange?.(newMode);
    };

    // Expose imperative API
    useImperativeHandle(
        ref,
        () => ({
            play: () => videoRef.current?.play(),
            pause: () => videoRef.current?.pause(),
            getVideoElement: () => videoRef.current,
            getConnectionMode: () => connectionMode,
        }),
        [connectionMode]
    );

    // Safe play helper
    const safePlay = () => {
        if (!videoRef.current) return;
        videoRef.current.play().catch(() => {
            if (!videoRef.current!.muted) {
                videoRef.current!.muted = true;
                videoRef.current!.play().catch((er) => console.warn(er));
            }
        });
    };

    // --- Utility functions ---
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
            if (media.indexOf("microphone") >= 0) {
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
            if (media.indexOf(kind) >= 0) {
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
    const handleMSE = (ws: WebSocket) => {
        updateMode("mse");
        let ms: MediaSource | any;
        if ("ManagedMediaSource" in window) {
            const Managed = (window as any).ManagedMediaSource;
            ms = new Managed();
            ms.addEventListener(
                "sourceopen",
                () => {
                    ws.send(
                        JSON.stringify({
                            type: "mse",
                            value: codecs(Managed.isTypeSupported),
                        })
                    );
                },
                { once: true }
            );
            videoRef.current!.disableRemotePlayback = true;
            videoRef.current!.srcObject = ms;
        } else {
            ms = new MediaSource();
            ms.addEventListener(
                "sourceopen",
                () => {
                    URL.revokeObjectURL(videoRef.current!.src);
                    ws.send(
                        JSON.stringify({
                            type: "mse",
                            value: codecs(MediaSource.isTypeSupported),
                        })
                    );
                },
                { once: true }
            );
            videoRef.current!.src = URL.createObjectURL(ms);
            videoRef.current!.srcObject = null;
        }

        safePlay();
        mseCodecs.current = "";

        onmessageRef.current["mse"] = (msg) => {
            if (msg.type !== "mse") return;
            mseCodecs.current = msg.value;

            const sb = ms.addSourceBuffer(msg.value);
            sb.mode = "segments";

            const buf = new Uint8Array(2 * 1024 * 1024);
            let bufLen = 0;

            sb.addEventListener("updateend", () => {
                if (!sb.updating && bufLen > 0) {
                    try {
                        const data = buf.slice(0, bufLen);
                        sb.appendBuffer(data);
                        bufLen = 0;
                    } catch {}
                }

                if (!sb.updating && sb.buffered && sb.buffered.length) {
                    const end = sb.buffered.end(sb.buffered.length - 1);
                    const start = end - 5;
                    const start0 = sb.buffered.start(0);
                    if (start > start0) {
                        sb.remove(start0, start);
                        ms.setLiveSeekableRange(start, end);
                    }
                    if (videoRef.current!.currentTime < start) {
                        videoRef.current!.currentTime = start;
                    }
                    const gap = end - videoRef.current!.currentTime;
                    videoRef.current!.playbackRate = gap > 0.1 ? gap : 0.1;
                }
            });

            ondataRef.current = (data) => {
                if (sb.updating || bufLen > 0) {
                    const b = new Uint8Array(data);
                    buf.set(b, bufLen);
                    bufLen += b.byteLength;
                } else {
                    try {
                        sb.appendBuffer(data);
                    } catch {}
                }
            };
        };
    };

    const handleWebRTC = (ws: WebSocket, onFail: () => void) => {
        updateMode("webrtc");
        const pc = new RTCPeerConnection(pcConfig);
        pcRef.current = pc;

        pc.addEventListener("icecandidate", (ev) => {
            if (
                ev.candidate &&
                mode.indexOf("webrtc/tcp") >= 0 &&
                (ev.candidate as any).protocol === "udp"
            )
                return;
            const candidate = ev.candidate
                ? ev.candidate.toJSON().candidate
                : "";
            ws.send(
                JSON.stringify({
                    type: "webrtc/candidate",
                    value: candidate,
                })
            );
        });

        pc.addEventListener("connectionstatechange", () => {
            if (pc.connectionState === "connected") {
                const tracks = pc
                    .getTransceivers()
                    .filter((tr) => tr.currentDirection === "recvonly")
                    .map((tr) => tr.receiver.track);
                if (videoRef.current) {
                    videoRef.current.srcObject = new MediaStream(tracks);
                    safePlay();
                }
            } else if (
                pc.connectionState === "failed" ||
                pc.connectionState === "disconnected"
            ) {
                console.warn("[VideoRTC] WebRTC failed, falling back...");
                pc.close();
                pcRef.current = null;
                onFail();
            }
        });

        onmessageRef.current["webrtc"] = (msg) => {
            switch (msg.type) {
                case "webrtc/candidate":
                    if (
                        mode.indexOf("webrtc/tcp") >= 0 &&
                        msg.value.indexOf(" udp ") > 0
                    )
                        return;
                    pc.addIceCandidate({
                        candidate: msg.value,
                        sdpMid: "0",
                    }).catch((er) => console.warn(er));
                    break;
                case "webrtc/answer":
                    pc.setRemoteDescription({
                        type: "answer",
                        sdp: msg.value,
                    }).catch((er) => console.warn(er));
                    break;
                case "error":
                    if (msg.value.indexOf("webrtc/offer") < 0) return;
                    pc.close();
                    onFail();
            }
        };

        createOffer(pc).then((offer) => {
            ws.send(JSON.stringify({ type: "webrtc/offer", value: offer.sdp }));
        });
    };

    const handleMJPEG = (ws: WebSocket) => {
        updateMode("mjpeg");
        ondataRef.current = (data) => {
            if (videoRef.current) {
                videoRef.current.controls = false;
                videoRef.current.poster =
                    "data:image/jpeg;base64," + btoaBytes(new Uint8Array(data));
            }
        };
        ws.send(JSON.stringify({ type: "mjpeg" }));
    };

    const handleHLS = (ws: WebSocket) => {
        updateMode("hls");
        onmessageRef.current["hls"] = (msg) => {
            if (msg.type !== "hls") return;
            const url =
                "http" + src?.substring(2, src.indexOf("/ws")) + "/hls/";
            const playlist = msg.value.replace("hls/", url);
            if (videoRef.current) {
                videoRef.current.src =
                    "data:application/vnd.apple.mpegurl;base64," +
                    btoa(playlist);
                safePlay();
            }
        };
        ws.send(
            JSON.stringify({
                type: "hls",
                value: codecs((t) => !!videoRef.current?.canPlayType(t)),
            })
        );
    };

    const handleMP4 = (ws: WebSocket) => {
        updateMode("mp4");
        const canvas = document.createElement("canvas");
        let context: CanvasRenderingContext2D | null = null;
        const video2 = document.createElement("video");
        video2.autoplay = true;
        video2.playsInline = true;
        video2.muted = true;

        video2.addEventListener("loadeddata", () => {
            if (!context) {
                canvas.width = video2.videoWidth;
                canvas.height = video2.videoHeight;
                context = canvas.getContext("2d");
            }
            context?.drawImage(video2, 0, 0, canvas.width, canvas.height);
            if (videoRef.current) {
                videoRef.current.controls = false;
                videoRef.current.poster = canvas.toDataURL("image/jpeg");
            }
        });

        ondataRef.current = (data) => {
            video2.src =
                "data:video/mp4;base64," + btoaBytes(new Uint8Array(data));
        };

        ws.send(
            JSON.stringify({
                type: "mp4",
                value: codecs((t) => !!videoRef.current?.canPlayType(t)),
            })
        );
    };

    // --- WebSocket lifecycle ---
    useEffect(() => {
        if (!wsSrc && !src) return;

        // Build WebSocket URL
        let wsUrl = wsSrc;
        if (proxy && wsUrl) {
            wsUrl = `${proxy}?target=${encodeURIComponent(wsUrl)}`;
        }

        const ws = new WebSocket(wsUrl);
        ws.binaryType = "arraybuffer";
        wsRef.current = ws;
        connectTS.current = Date.now();

        ws.addEventListener("open", () => {
            console.log("[VideoRTC] WebSocket open");
            ondataRef.current = null;
            onmessageRef.current = {};

            // --- Negotiation order: WebRTC → MSE → HLS → MP4 → MJPEG ---
            const tryFallback = () => {
                if (
                    mode.indexOf("mse") >= 0 &&
                    ("MediaSource" in window || "ManagedMediaSource" in window)
                ) {
                    handleMSE(ws);
                } else if (
                    mode.indexOf("hls") >= 0 &&
                    videoRef.current?.canPlayType(
                        "application/vnd.apple.mpegurl"
                    )
                ) {
                    handleHLS(ws);
                } else if (mode.indexOf("mp4") >= 0) {
                    handleMP4(ws);
                } else if (mode.indexOf("mjpeg") >= 0) {
                    handleMJPEG(ws);
                }
            };

            if (
                !forceFallback &&
                mode.indexOf("webrtc") >= 0 &&
                "RTCPeerConnection" in window
            ) {
                handleWebRTC(ws, tryFallback);
            } else {
                tryFallback();
            }
        });

        ws.addEventListener("message", (ev) => {
            if (typeof ev.data === "string") {
                const msg = JSON.parse(ev.data);
                for (const mode in onmessageRef.current) {
                    onmessageRef.current[mode](msg);
                }
            } else {
                ondataRef.current?.(ev.data);
            }
        });

        ws.addEventListener("close", () => {
            console.log("[VideoRTC] WebSocket closed, scheduling reconnect");
            const delay = Math.max(15000 - (Date.now() - connectTS.current), 0);
            reconnectTID.current = window.setTimeout(() => {
                wsRef.current = null;
            }, delay);
        });

        return () => {
            if (reconnectTID.current) clearTimeout(reconnectTID.current);
            ws.close();
            wsRef.current = null;
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }
        };
    }, [wsSrc, src, proxy, mode, media, forceFallback]);

    // Visibility + background handling
    useEffect(() => {
        if (background) return;

        const handleVisibility = () => {
            if (document.hidden) {
                videoRef.current?.pause();
            } else {
                safePlay();
            }
        };

        if (visibilityCheck) {
            document.addEventListener("visibilitychange", handleVisibility);
        }

        let observer: IntersectionObserver | null = null;
        if ("IntersectionObserver" in window && visibilityThreshold > 0) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            videoRef.current?.pause();
                        } else {
                            safePlay();
                        }
                    });
                },
                { threshold: visibilityThreshold }
            );
            if (videoRef.current) observer.observe(videoRef.current);
        }

        return () => {
            if (visibilityCheck) {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibility
                );
            }
            if (observer && videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, [background, visibilityCheck, visibilityThreshold]);

    return (
        <video
            ref={videoRef}
            autoPlay={autoPlay}
            controls={controls}
            playsInline
            preload="auto"
            className={className}
            style={{
                display: "block",
                width: "100%",
                height: "100%",
                ...style,
            }}
        />
    );
}
