"use client";
import { useState, useEffect, useRef } from "react";
import { lexend, funnel } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import CameraPreview from "@/components/docs/camera-preview";
import TogglePreview from "@/components/docs/trigger-preview";
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import { Logo } from "@/lib/svg";
import CanvasVideoBridge from "@/components/docs/canvas-view-bridge";

const VIDEO_SOURCES = [
    {
        id: "bunny",
        src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
        id: "sintel",
        src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    },
];

const imageURLs = ["/image-1.webp", "/image-2.webp", "/image-3.webp"];

export default function Home() {
    const [layout, setLayout] = useState<"A" | "B">("A");

    useEffect(() => {
        const updateLayout = () => {
            const hash = window.location.hash;
            if (hash === "#cameraLayout") setLayout("B");
            else setLayout("A");
        };

        updateLayout();
        window.addEventListener("hashchange", updateLayout);
        return () => window.removeEventListener("hashchange", updateLayout);
    }, []);

    return (
        <div className="mx-auto flex min-h-svh w-full flex-row gap-8 p-16 dark:bg-zinc-950">
            <Image
                alt="Mountains"
                src="/background.svg"
                quality={100}
                fill
                sizes="100vw opactity-10"
                style={{
                    objectFit: "cover",
                }}
            />
            <Sidebar />

            {layout == "A" ? (
                <div className="w-180 space-y-8">
                    <header className="flex flex-col space-y-2">
                        <h1 className="flex items-center gap-x-4 text-5xl font-bold tracking-tight">
                            HA Components
                            <Logo className="size-10" />
                        </h1>
                        <h3 className={cn("text-muted-foreground text-2xl", funnel.className)}>
                            Fully Customise your Home Assistant Dashboard.
                        </h3>
                    </header>

                    <div className="w-180 space-y-4">
                        <TogglePreview />
                    </div>
                </div>
            ) : (
                <div className="w-180 space-y-8">
                    <header className="flex flex-col space-y-2">
                        <h1 className="flex items-center gap-x-4 text-5xl font-bold tracking-tight">
                            HA Components
                            <Logo className="size-10" />
                        </h1>
                        <h3 className={cn("text-muted-foreground text-2xl", funnel.className)}>
                            Fully Customise your Home Assistant Dashboard.
                        </h3>
                    </header>

                    <div>
                        <h3 className={cn("py-6 text-2xl font-bold", funnel.className)}>
                            Example Security Camera Dashboard
                        </h3>
                        <div className="flex w-fit flex-row space-x-4">
                            <div>
                                <div className="h-fit w-[70rem] bg-black">
                                    <CameraPreview autoPlay={true} />
                                </div>
                                <h3 className="text-lg">Big Buck Bunny Camera</h3>
                            </div>
                            <div className="space-y-3">
                                {imageURLs.map((image, i) => (
                                    <div key={i} className="h-fit w-80 bg-black">
                                        <CanvasVideoBridge image={image} />
                                        <h3 className="text-lg">Cat Camera {i + 1}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
