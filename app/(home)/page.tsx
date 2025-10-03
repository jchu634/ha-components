"use client";
import * as React from "react";
import { lexend, funnel } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import CameraPreview from "@/components/docs/camera-preview";
import TogglePreview from "@/components/docs/trigger-button-preview";

export default function Home() {
    return (
        <div className="w-full mx-auto flex flex-row min-h-svh p-16 gap-8">
            <div className="w-180 space-y-4 ">
                <header className="flex flex-col space-y-2">
                    <h1 className="text-5xl font-bold tracking-tight">HA Components</h1>
                    <h3 className={cn("text-muted-foreground text-2xl", funnel.className)}>
                        Fully Customise your Home Assistant Dashboard.
                    </h3>
                </header>
                <Card className="w-full p-8">
                    <h3 className={cn("text-muted-foreground text-2xl", funnel.className)}>Cameras</h3>
                    <CameraPreview />
                </Card>
            </div>
            <div className="w-180 space-y-4 ">
                <TogglePreview />
            </div>
        </div>
    );
}
