"use client";
import CameraPreview from "@/components/docs/camera-preview";
import TriggerPreview from "@/components/docs/trigger-preview";
import LightPreview from "@/components/docs/light-preview";

export default function Home() {
    return (
        <div className="w-full p-8 mx-auto flex flex-col min-h-svh  gap-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Showcase</h1>
                <p className="text-muted-foreground">All variants and elements</p>
            </header>
            <div className="flex space-x-8">
                <div className="w-100 min-w-[100]">
                    <h3 className="text-xl font-bold tracking-tight">Camera Component</h3>
                    <span className="block border w-100% my-2 border-foreground mb-4" />
                    <CameraPreview />
                </div>
                <span className="border h-100% mx-2 border-foreground" />
                <div className="flex flex-col space-y-4">
                    <h3 className="text-xl font-bold tracking-tight">Trigger Buttons Component</h3>
                    <span className="block border w-100% my-2 border-foreground mb-4" />
                    <div className="flex space-x-4">
                        <TriggerPreview />
                        <TriggerPreview variant="destructive" />
                        <TriggerPreview variant="outline" />
                    </div>
                    <div className="flex space-x-4">
                        <TriggerPreview variant="secondary" />
                        <TriggerPreview variant="ghost" />
                        <TriggerPreview variant="link" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 w-fit">
                <h3 className="text-xl font-bold tracking-tight">Trigger Buttons Component</h3>
                <span className="block border w-100% my-2 border-foreground mb-4" />

                <div className="flex space-x-8">
                    <LightPreview />
                    <span className="border h-100% mx-2 border-foreground" />
                    <LightPreview variant="Accordion" />
                    <span className="border h-100% mx-2 border-foreground" />
                    <LightPreview variant="Popup" />
                    <span className="border h-100% mx-2 border-foreground" />
                    <LightPreview variant="SeperatePopups" />
                </div>
            </div>
        </div>
    );
}
