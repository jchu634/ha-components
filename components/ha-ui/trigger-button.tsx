"use client";
import type { EntityId } from "@/types/entity-types";
import { Button } from "@/components/ui/button";
import { haWebSocket } from "@/lib/haWebsocket";

export interface TriggerButtonProps {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
    description?: string;
    domain?: string;
    service?: string;
}
export function TriggerButton({
    entity,
    description,
    domain = "automation",
    service = "trigger",
}: TriggerButtonProps) {
    return (
        <div>
            <Button
                onClick={() =>
                    haWebSocket.callService(domain, service, {
                        entity_id: entity,
                    })
                }
            ></Button>
        </div>
    );
}
