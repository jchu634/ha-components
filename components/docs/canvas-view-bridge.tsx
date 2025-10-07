"use client";

import { useEffect, useRef } from "react";
import CameraPreview from "@/components/docs/camera-preview";

export default function CanvasVideoBridge({ image }: { image: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw static image
        const img = new window.Image();
        img.src = image;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Capture live stream
            const stream = canvas.captureStream(1);

            // Find <video> inside CameraPreview
            const videoEl = containerRef.current?.querySelector("video");
            if (videoEl) {
                (videoEl as HTMLVideoElement).srcObject = stream;
                // Auto‑play it
                videoEl.play().catch((err) => console.warn("Autoplay prevented:", err));
            }
        };
    }, [image]);

    return (
        <div ref={containerRef}>
            {/* generic component unchanged */}
            <CameraPreview autoPlay={true} />
            {/* hidden canvas acts as stream source */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
}
