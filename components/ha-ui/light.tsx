"use client";
import type { EntityId } from "@/types/entity-types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export interface LightProps {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
}

export function Light({ entity }: LightProps) {
    const [state, setState] = useState("off");
    return (
        <div className="space-y-4">
            <Button onClick={() => haWebSocket.callService("light", "toggle", { entity_id: entity })}>
                Toggle Light ({state})
            </Button>
        </div>
    );
}
