"use client";
import { Switch } from "@/components/ui/switch";
export default function TriggerButtonPreview({ ...props }) {
    return (
        <Switch
            title="Button that Triggers Stuff"
            {...props}
            style={{ ["--switch-width" as any]: "6rem", ["--switch-height" as any]: "2rem" }}
        ></Switch>
    );
}
