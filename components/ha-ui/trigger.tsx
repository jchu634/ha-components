"use client";
import type { EntityId } from "@/types/entity-types";
import { Button } from "@/components/ui/button";
import { haWebSocket } from "@/lib/haWebsocket";

type TriggerProps = React.ComponentProps<typeof Button> & {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
    description?: string;
    domain?: string;
    service?: string;
};

export function Trigger({
    entity,
    description,
    domain = "automation",
    service = "trigger",
    children,
    ...props // Button Props
}: TriggerProps) {
    return (
        <Button
            onClick={() =>
                haWebSocket.callService(domain, service, {
                    entity_id: entity,
                })
            }
            title={description}
            {...props}
        >
            {children}
        </Button>
    );
}
