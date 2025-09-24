"use client";
import CameraPreview from "@/components/docs/camera-preview";
import TriggerButtonPreview from "@/components/docs/trigger-button-preview";

export default function Home() {
    return (
        <div className="w-full p-8 mx-auto flex flex-col min-h-svh  gap-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Showcase</h1>
                <p className="text-muted-foreground">All variants and elements</p>
            </header>
            <div className="flex space-x-8">
                <div className="w-100">
                    <h3 className="text-xl font-bold tracking-tight">Camera Component</h3>
                    <CameraPreview />
                </div>

                <div className="flex flex-col space-y-4">
                    <h3 className="text-xl font-bold tracking-tight">Trigger Buttons Component</h3>
                    <div className="flex space-x-4">
                        <TriggerButtonPreview />
                        <TriggerButtonPreview variant="destructive" />
                        <TriggerButtonPreview variant="outline" />
                    </div>
                    <div className="flex space-x-4">
                        <TriggerButtonPreview variant="secondary" />
                        <TriggerButtonPreview variant="ghost" />
                        <TriggerButtonPreview variant="link" />
                    </div>
                </div>
            </div>
            <div className="flex space-x-8"></div>
        </div>
    );
}
