"use client";
import type { EntityId } from "@/types/entity-types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { haWebSocket } from "@/lib/haWebsocket";

type ToggleButtonProps = React.ComponentProps<typeof Button> & {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
    description?: string;
    domain: string;
    service?: string;
};

export function ToggleButton({
    entity,
    domain,
    service = "toggle",
    children,
    ...props // Button Props
}: ToggleButtonProps) {
    const [monitoredState, setMonitoredState] = useState(false);

    useEffect(() => {
        // Load Initial State
        haWebSocket.getState(entity).then((data) => {
            if (data) {
                setMonitoredState(data.state === "on");
            }
        });
        // Subscribe to state updates
        const handler = (newState: any) => {
            setMonitoredState(newState.state === "on");
        };
        haWebSocket.addStateListener(entity, handler);

        return () => haWebSocket.removeStateListener(entity, handler);
    }, [entity]);

    return (
        <Switch
            checked={monitoredState}
            onCheckedChange={(state) => {
                haWebSocket.callService(domain, service, {
                    entity_id: entity,
                });
                haWebSocket.getState(entity).then((data) => {
                    if (data) {
                        console.log(data);
                    }
                });
            }}
            style={{ ["--switch-width" as any]: "6rem", ["--switch-height" as any]: "2rem" }}
        ></Switch>
    );
}
