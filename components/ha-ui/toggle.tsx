"use client";
import type { EntityId } from "@/types/entity-types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { haWebSocket } from "@/lib/haWebsocket";

type ToggleProps = React.ComponentProps<typeof Button> & {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
    domain: string;
    service?: string;
};

export function Toggle({
    entity,
    domain,
    service = "toggle",
    ...props // Button Props
}: ToggleProps) {
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
            onCheckedChange={() =>
                haWebSocket.callService(domain, service, {
                    entity_id: entity,
                })
            }
            style={{ ["--switch-width" as any]: "6rem", ["--switch-height" as any]: "2rem" }}
            {...props}
        ></Switch>
    );
}
