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
    return (
        <div>
            <Button>
                <Slider defaultValue={[33]} max={100} step={1} />
            </Button>
        </div>
    );
}
