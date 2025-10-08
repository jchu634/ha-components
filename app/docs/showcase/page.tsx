"use client";
import CameraPreview from "@/components/docs/camera-preview";
import TriggerPreview from "@/components/docs/trigger-preview";
import LightPreview from "@/components/docs/light-preview";
import TogglePreview from "@/components/docs/toggle-preview";

export default function Home() {
    return (
        <div className="mx-auto flex min-h-svh w-full flex-col gap-8 p-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Showcase</h1>
                <p className="text-muted-foreground">All variants and elements</p>
            </header>
            <div className="space-x-8 lg:flex">
                <div className="w-100 min-w-[100]">
                    <h3 className="text-xl font-bold tracking-tight">Camera Component</h3>
                    <span className="w-100% border-foreground my-2 mb-4 block border" />
                    <CameraPreview />
                </div>
                <span className="h-100% border-foreground mx-2 lg:border" />
                <div className="flex flex-col space-y-4">
                    <h3 className="text-xl font-bold tracking-tight">Trigger Buttons Component</h3>
                    <span className="w-100% border-foreground my-2 mb-4 block border" />
                    <div className="flex w-fit flex-col space-y-4 2xl:flex-row 2xl:space-x-4">
                        <TriggerPreview>Button that Triggers Stuff</TriggerPreview>
                        <TriggerPreview variant="destructive">Button that Triggers Stuff</TriggerPreview>
                        <TriggerPreview variant="outline">Button that Triggers Stuff</TriggerPreview>
                    </div>
                    <div className="flex w-fit flex-col space-y-4 2xl:flex-row 2xl:space-x-4">
                        <TriggerPreview variant="secondary">Button that Triggers Stuff</TriggerPreview>
                        <TriggerPreview variant="ghost">Button that Triggers Stuff</TriggerPreview>
                        <TriggerPreview variant="link">Button that Triggers Stuff</TriggerPreview>
                    </div>
                    <h3 className="pt-8 text-xl font-bold tracking-tight">Toggle Component</h3>
                    <span className="w-100% border-foreground my-2 mb-4 block border" />

                    <TogglePreview />
                </div>
            </div>

            <div className="w-fit space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Light Control Component</h3>
                <span className="w-100% border-foreground my-2 mb-4 block border" />

                <div className="space-x-8 lg:flex">
                    <LightPreview />
                    <span className="h-100% border-foreground mx-2 lg:border" />
                    <LightPreview variant="Accordion" />
                    <span className="h-100% border-foreground mx-2 lg:border" />
                    <LightPreview variant="Popup" />
                    <span className="h-100% border-foreground mx-2 lg:border" />
                    <LightPreview variant="SeperatePopups" />
                </div>
            </div>
        </div>
    );
}
