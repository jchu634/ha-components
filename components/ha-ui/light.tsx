"use client";
import type { EntityId } from "@/types/entity-types";
import { useState, useEffect, useMemo, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { haWebSocket } from "@/lib/haWebsocket";

export interface LightProps {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
}

function throttle<F extends (...args: any[]) => void>(fn: F, limit: number) {
    let inThrottle = false;
    let lastArgs: Parameters<F> | null = null;
    return (...args: Parameters<F>) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                if (lastArgs) {
                    fn(...lastArgs);
                    lastArgs = null;
                }
            }, limit);
        } else {
            lastArgs = args;
        }
    };
}

export function Light({ entity }: LightProps) {
    const [brightness, setBrightness] = useState(128);
    const [state, setState] = useState("off");
    const pendingBrightness = useRef<number | null>(null);

    // Throttled service call
    const throttledSetBrightness = useMemo(
        () =>
            throttle((value: number) => {
                pendingBrightness.current = value;
                haWebSocket.callService("light", "turn_on", {
                    entity_id: entity,
                    brightness: value,
                });
            }, 150), // Throttle: 150ms per update
        [entity]
    );

    useEffect(() => {
        // Load Initial State
        haWebSocket.getState(entity).then((data) => {
            if (data) {
                setState(data.state);
                if (data.attributes?.brightness !== undefined) {
                    setBrightness(data.attributes.brightness);
                }
            }
        });
        // Subscribe to state updates
        const handler = (newState: any) => {
            setState(newState.state);

            const wsBrightness = newState.attributes?.brightness;
            if (wsBrightness !== undefined) {
                // If we’re waiting for HA to confirm a change
                if (pendingBrightness.current !== null) {
                    if (wsBrightness === pendingBrightness.current) {
                        // Matched: HA confirmed, clear lock and update slider
                        setBrightness(wsBrightness);
                        pendingBrightness.current = null;
                    } else {
                        // Ignore intermediate mismatched updates (rollback case)
                        return;
                    }
                } else {
                    // Normal case: accept HA brightness
                    setBrightness(wsBrightness);
                }
            }
        };
        haWebSocket.addStateListener(entity, handler);

        return () => haWebSocket.removeStateListener(entity, handler);
    }, [entity]);

    return (
        <div className="space-y-4">
            <Slider
                value={[brightness]}
                max={255}
                step={5}
                size={30}
                orientation="vertical"
                onValueChange={(value) => {
                    setBrightness(value[0]); // Update UI in real-time
                    throttledSetBrightness(value[0]); // Throttle updates to prevent desync issues
                }}
            />
            <Button onClick={() => haWebSocket.callService("light", "toggle", { entity_id: entity })}>
                Toggle Light ({state})
            </Button>
        </div>
    );
}
