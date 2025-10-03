"use client";
import * as React from "react";
import { Camera } from "@/components/ha-ui/camera";
import { Light } from "@/components/ha-ui/light";
import { Trigger } from "@/components/ha-ui/trigger";
import { Toggle } from "@/components/ha-ui/toggle";
import { Card } from "@/components/ui/card";

export default function Home() {
    return (
        <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Custom Registry</h1>
                <p className="text-muted-foreground">A custom registry for distributing code using shadcn.</p>
            </header>
            <main className="flex flex-col flex-1 gap-8">
                <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm text-muted-foreground sm:pl-3">A Simple Camera Component</h2>
                    </div>
                    <div className="flex items-center justify-center min-h-[400px] relative">
                        <Camera
                            entity="camera.g4_doorbell_high"
                            proxyURL="ws://localhost:8080/proxy"
                            aspectRatio="4/3"
                        />
                    </div>
                    <div className="flex items-center justify-center min-h-[400px] relative">
                        <Camera
                            entity="camera.g3_dome_high_resolution_channel_3"
                            proxyURL="ws://localhost:8080/proxy"
                        />
                    </div>
                </div>
            </main>
            <main className="flex flex-col flex-1 gap-8">
                <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm text-muted-foreground sm:pl-3">A Simple Light Component</h2>
                    </div>
                    <div className="flex items-center justify-center min-h-[400px] relative">
                        <Light entity="light.dining_group_1" variant="Default" overrideSupportColorRGB={true} />
                    </div>
                    <div className="flex items-center justify-center min-h-[400px] relative">
                        <Light entity="light.dining_group_1" variant="Accordion" overrideSupportColorRGB={true} />
                    </div>
                    <div className="flex items-center justify-center min-h-[400px] relative">
                        <Light entity="light.dining_group_1" variant="Popup" overrideSupportColorRGB={true} />
                    </div>
                    <div className="flex items-center justify-center min-h-[400px] relative">
                        <Light entity="light.dining_group_1" variant="SeperatePopups" overrideSupportColorRGB={true} />
                    </div>
                </div>
            </main>
            <main className="flex flex-col flex-1 gap-8">
                <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm text-muted-foreground sm:pl-3">
                            A Simple Button Component that triggers an service
                        </h2>
                    </div>
                    <div className="flex items-center justify-center min-h-[400px] relative">
                        <Trigger entity="automation.test_toggle_lights" description="test">
                            test
                        </Trigger>
                    </div>
                </div>
            </main>
            <main className="flex flex-col flex-1 gap-8">
                <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm text-muted-foreground sm:pl-3">
                            A Simple Button Component that triggers an service
                        </h2>
                    </div>
                    <div className="flex items-center justify-center min-h-[400px] relative">
                        <Card className="size-40 flex p-4">
                            <p>Toggle Switch</p>

                            <Toggle entity="light.dining_lights" domain="light" />
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
