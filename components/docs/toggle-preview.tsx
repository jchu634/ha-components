"use client";
import { Switch } from "@/components/ha-ui/ui/switch";
export default function TriggerButtonPreview({ ...props }) {
    return (
        <Switch
            title="Button that Triggers Stuff"
            {...props}
            style={{ ["--switch-width" as any]: "6rem", ["--switch-height" as any]: "2rem" }}
        ></Switch>
    );
}
