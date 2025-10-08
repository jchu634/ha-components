"use client";
import { Button } from "@/components/ui/button";
export default function TriggerButtonPreview({ children, ...props }: any) {
    return (
        <Button title="Button that Triggers Stuff" {...props}>
            {children}
        </Button>
    );
}
