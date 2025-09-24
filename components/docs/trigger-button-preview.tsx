"use client";
import { Button } from "@/components/ui/button";
export default function TriggerButtonPreview({ ...props }) {
    return (
        <Button title="Button that Triggers Stuff" {...props}>
            Button that Triggers Stuff
        </Button>
    );
}
