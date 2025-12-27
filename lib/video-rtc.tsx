import { useEffect, useRef, useState } from "react";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export interface UseWebRTCOptions {
    /**
     * WebSocket URL for go2rtc stream (e.g. ws://localhost:5555/websocketVideo)
     */
    wsSrc: string;
    /**
     * Optional Proxy server to forward websocket requests over (e.g. ws://localhost:5555/proxy)
     */
    proxy?: string;
    /**
     * Media types to receive (default: "video,audio")
     * Supports: "video", "audio", "video,audio"
     */
    media?: string;
    /**
     * Whether the connection should be active (default: true)
     */
    enabled?: boolean;
    /**
     * Whether to automatically reconnect on disconnection (default: false)
     */
    autoReconnect?: boolean;
    /**
     * Delay before retrying connection in ms (default: 5000)
     */
    retryDelay?: number;
    /**
     * Maximum number of reconnect attempts (default: 5)
     */
    maxReconnectAttempts?: number;
}

export interface WebRTCConnection {
    /**
     * Current connection status
     */
    status: ConnectionStatus;
    /**
     * Last error that occurred, if any
     */
    error: Error | null;
    /**
     * The MediaStream received from the remote peer
     * Can be attached directly to a video element via srcObject
     */
    mediaStream: MediaStream | null;
    /**
     * Number of reconnect attempts made
     */
    reconnectAttempts: number;
    /**
     * Function to manually trigger a reconnection attempt
     */
    retry: () => void;
}

const DEFAULT_PEERCONNECTION_CONFIG: RTCConfiguration = {
    bundlePolicy: "max-bundle",
    iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }, { urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTC({
    wsSrc,
    proxy,
    media = "video,audio",
    enabled = true,
    autoReconnect = false,
    retryDelay = 5000,
    maxReconnectAttempts = 5,
}: UseWebRTCOptions): WebRTCConnection {
    const [status, setStatus] = useState<ConnectionStatus>(enabled ? "connecting" : "connecting");
    const [error, setError] = useState<Error | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    // Refs to avoid stale closures
    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const reconnectTimerRef = useRef<number | null>(null);
    const isConnectingRef = useRef(false);
    const optionsRef = useRef({ enabled, autoReconnect, maxReconnectAttempts, retryDelay });

    // Update options ref when they change
    useEffect(() => {
        optionsRef.current = { enabled, autoReconnect, maxReconnectAttempts, retryDelay };
    }, [enabled, autoReconnect, maxReconnectAttempts, retryDelay]);

    const connect = async () => {
        const opts = optionsRef.current;
        if (!opts.enabled || isConnectingRef.current) return;
        isConnectingRef.current = true;

        try {
            // 1. Create RTCPeerConnection
            const pc = new RTCPeerConnection(DEFAULT_PEERCONNECTION_CONFIG);
            pcRef.current = pc;

            // 2. Add transceivers BEFORE offer
            if (media.includes("video")) pc.addTransceiver("video", { direction: "recvonly" });
            if (media.includes("audio")) pc.addTransceiver("audio", { direction: "recvonly" });

            // 3. Set up ICE candidate handler BEFORE WebSocket
            pc.onicecandidate = (ev) => {
                if (ev.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(
                        JSON.stringify({
                            type: "webrtc/candidate",
                            value: ev.candidate.candidate,
                        }),
                    );
                }
            };

            // 4. Handle tracks
            pc.ontrack = (ev) => {
                const stream = ev.streams[0] || new MediaStream([ev.track]);
                setMediaStream(stream);
                setStatus("connected");
                setError(null);
                setReconnectAttempts(0);
            };

            pc.onconnectionstatechange = () => {
                if (
                    pc.connectionState === "failed" ||
                    pc.connectionState === "disconnected" ||
                    pc.connectionState === "closed"
                ) {
                    handleDisconnect("WebRTC connection failed");
                }
            };

            // 5. Create WebSocket AFTER PeerConnection is fully configured
            let wsUrl = wsSrc;
            if (proxy) wsUrl = `${proxy}?target=${encodeURIComponent(wsUrl)}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            // 6. WebSocket event handlers
            ws.onopen = async () => {
                try {
                    // Create and send offer
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    ws.send(
                        JSON.stringify({
                            type: "webrtc/offer",
                            value: offer.sdp,
                        }),
                    );
                } catch (err) {
                    handleError(err as Error);
                }
            };

            ws.onmessage = async (ev) => {
                try {
                    const msg = JSON.parse(ev.data);
                    if (msg.type === "webrtc/answer") {
                        await pc.setRemoteDescription({ type: "answer", sdp: msg.value });
                    } else if (msg.type === "webrtc/candidate") {
                        await pc.addIceCandidate({ candidate: msg.value, sdpMid: "0" });
                    }
                } catch (err) {
                    console.warn("[useWebRTC] Failed to parse message:", err);
                }
            };

            ws.onclose = () => handleDisconnect("WebSocket closed");
            ws.onerror = () => handleDisconnect("WebSocket error");
        } catch (err) {
            handleError(err as Error);
        } finally {
            isConnectingRef.current = false;
        }
    };

    const handleDisconnect = (reason: string) => {
        const opts = optionsRef.current;
        cleanup();

        if (opts.autoReconnect && reconnectAttempts < opts.maxReconnectAttempts) {
            setStatus("disconnected");
            setError(new Error(reason));

            reconnectTimerRef.current = window.setTimeout(() => {
                setReconnectAttempts((prev) => prev + 1);
                connect();
            }, opts.retryDelay);
        } else {
            setStatus("error");
            setError(new Error(reason));
        }
    };

    const handleError = (err: Error) => {
        console.error("[useWebRTC] Error:", err);
        setStatus("error");
        setError(err);
    };

    const cleanup = () => {
        if (wsRef.current) {
            try {
                wsRef.current.close();
            } catch {
                // ignore
            }
            wsRef.current = null;
        }
        if (pcRef.current) {
            try {
                pcRef.current.close();
            } catch {
                // ignore
            }
            pcRef.current = null;
        }
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
        }
    };

    const retry = () => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
        }
        setReconnectAttempts(0);
        setStatus("connecting");
        setError(null);
        connect();
    };

    // Connect on mount and when enabled changes
    useEffect(() => {
        if (enabled) {
            connect();
        }

        return () => {
            cleanup();
        };
    }, [enabled]);

    return {
        status,
        error,
        mediaStream,
        reconnectAttempts,
        retry,
    };
}
