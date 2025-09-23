"use client";
import type { EntityId } from "@/types/entity-types";
import { Button } from "@/components/ui/button";
import { haWebSocket } from "@/lib/haWebsocket";

type TriggerButtonProps = React.ComponentProps<typeof Button> & {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
    description?: string;
    domain?: string;
    service?: string;
};

export function TriggerButton({
    entity,
    description,
    domain = "automation",
    service = "trigger",
    children,
    ...props // Button Props
}: TriggerButtonProps) {
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
