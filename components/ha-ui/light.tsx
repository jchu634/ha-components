"use client";
import type { EntityId } from "@/types/entity-types";
import { useState, useEffect, useMemo, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { haWebSocket } from "@/lib/haWebsocket";
import { RgbColorPicker } from "react-colorful"; // npm install react-colorful
import { PowerIcon } from "lucide-react";

export interface LightProps {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
    hideControls?: Boolean;
    overrideSupportColorRGB?: boolean;
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

// Approximate conversion Kelvin → RGB
// Valid for ~1000K - 40000K
function kelvinToRGB(kelvin: number): [number, number, number] {
    let temperature = kelvin / 100;
    let red, green, blue;

    if (temperature <= 66) {
        red = 255;
        green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
        blue = temperature <= 19 ? 0 : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
    } else {
        red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592);
        green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492);
        blue = 255;
    }

    return [
        Math.min(255, Math.max(0, Math.round(red))),
        Math.min(255, Math.max(0, Math.round(green))),
        Math.min(255, Math.max(0, Math.round(blue))),
    ];
}

export function Light({ entity, hideControls = true, overrideSupportColorRGB = false }: LightProps) {
    const [brightness, setBrightness] = useState(128);
    const [colorTempK, setColorTempK] = useState<number | null>(null);
    const [rgbColor, setRgbColor] = useState<[number, number, number] | null>(null);

    const [state, setState] = useState("off");
    const [activeMode, setActiveMode] = useState<string | null>(null);

    const [supportsColor, setSupportsColor] = useState(false);
    const [supportsColorTemp, setSupportsColorTemp] = useState(false);
    const [minTemp, setMinTemp] = useState(2000);
    const [maxTemp, setMaxTemp] = useState(6500);

    const pendingBrightness = useRef<number | null>(null);
    const pendingTemp = useRef<number | null>(null);
    const pendingRgb = useRef<[number, number, number] | null>(null);

    const minRGB = kelvinToRGB(minTemp);
    const maxRGB = kelvinToRGB(maxTemp);

    // Throttled API Calls

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

    const throttledColorTemp = useMemo(
        () =>
            throttle((kelvin: number) => {
                pendingTemp.current = kelvin;
                haWebSocket.callService("light", "turn_on", {
                    entity_id: entity,
                    color_temp_kelvin: kelvin,
                });
            }, 200),
        [entity]
    );

    const throttledRgb = useMemo(
        () =>
            throttle((rgb: [number, number, number]) => {
                pendingRgb.current = rgb;
                haWebSocket.callService("light", "turn_on", {
                    entity_id: entity,
                    rgb_color: rgb,
                });
            }, 200),
        [entity]
    );

    useEffect(() => {
        // Load Initial State
        haWebSocket.getState(entity).then((data) => {
            if (data) {
                const { attributes } = data;
                setState(data.state);
                if (attributes?.brightness !== undefined && attributes?.brightness !== null) {
                    setBrightness(attributes.brightness);
                }
                if (attributes?.color_temp_kelvin && attributes?.color_temp_kelvin !== null) {
                    setColorTempK(attributes.color_temp_kelvin);
                }
                if (
                    attributes?.rgb_color !== undefined &&
                    attributes?.rgb_color !== null &&
                    activeMode !== "color_temp"
                ) {
                    setRgbColor(attributes.rgb_color);
                }
                if (attributes?.color_mode) {
                    setActiveMode(attributes.color_mode);
                }

                // Detect supported Color Features
                const modes: string[] = attributes?.supported_color_modes || [];
                if (modes.includes("color_temp")) {
                    setSupportsColorTemp(true);
                    setMinTemp(attributes.min_color_temp_kelvin || 2000);
                    setMaxTemp(attributes.max_color_temp_kelvin || 6500);
                }
                if (
                    modes.includes("hs") ||
                    modes.includes("rgb") ||
                    modes.includes("rgbw") ||
                    modes.includes("rgbww") ||
                    modes.includes("xy")
                ) {
                    setSupportsColor(true);
                }
            }
        });
        // Subscribe to state updates
        const handler = (newState: any) => {
            setState(newState.state);
            const { attributes } = newState;

            // Brightness confirm with tolerance
            if (attributes?.brightness !== undefined && attributes?.brightness !== null) {
                if (pendingBrightness.current !== null) {
                    if (Math.abs(attributes.brightness - pendingBrightness.current) <= 2) {
                        setBrightness(attributes.brightness);
                        pendingBrightness.current = null;
                    } else {
                        return; // rollback -> ignore
                    }
                } else {
                    setBrightness(attributes.brightness);
                }
            }

            // Color Temp confirm with tolerance
            if (attributes?.color_temp_kelvin !== undefined && attributes?.color_temp_kelvin !== null) {
                if (pendingTemp.current !== null) {
                    if (Math.abs(attributes.color_temp_kelvin - pendingTemp.current) <= 50) {
                        setColorTempK(attributes.color_temp_kelvin);
                        pendingTemp.current = null;
                    } else {
                        return;
                    }
                } else {
                    setColorTempK(attributes.color_temp_kelvin);
                }
            }

            // RGB confirm with tolerance
            if (
                attributes?.rgb_color !== undefined &&
                attributes?.rgb_color !== null &&
                attributes.rgb_color.length === 3
            ) {
                const [r, g, b] = attributes.rgb_color;
                if (pendingRgb.current !== null) {
                    const [pr, pg, pb] = pendingRgb.current;
                    if (Math.abs(r - pr) <= 2 && Math.abs(g - pg) <= 2 && Math.abs(b - pb) <= 2) {
                        setRgbColor([r, g, b]);
                        pendingRgb.current = null;
                    } else {
                        return;
                    }
                } else {
                    setRgbColor([r, g, b]);
                }
            }
        };
        haWebSocket.addStateListener(entity, handler);

        return () => haWebSocket.removeStateListener(entity, handler);
    }, [entity]);

    return (
        <div
            className="flex space-x-4"
            style={
                {
                    "--min-rgb": `rgb(${minRGB.join(",")})`,
                    "--max-rgb": `rgb(${maxRGB.join(",")})`,
                } as React.CSSProperties
            }
        >
            <Slider
                value={[brightness]}
                max={255}
                step={5}
                size={30}
                className="w-[400px]"
                orientation="vertical"
                onValueChange={(value) => {
                    setBrightness(value[0]); // Update UI in real-time
                    throttledSetBrightness(value[0]); // Throttle updates to prevent desync issues
                }}
            />
            {hideControls ? (
                <Accordion type="single" collapsible orientation="horizontal" className="h-100%">
                    <AccordionItem value="item-1" orientation="horizontal" className="h-full">
                        <div className="flex flex-col h-full justify-between">
                            <AccordionTrigger orientation="horizontal"></AccordionTrigger>
                            <Button
                                size="icon"
                                onClick={() => {
                                    haWebSocket.callService("light", "toggle", { entity_id: entity });
                                    if (state === "off") {
                                        // preselect a mode when turning on
                                        if (supportsColorTemp) {
                                            setActiveMode("color_temp");
                                        } else if (supportsColor) {
                                            setActiveMode("rgb");
                                        }
                                    }
                                }}
                            >
                                <PowerIcon />
                            </Button>
                        </div>

                        <AccordionContent orientation="horizontal" className="py-0">
                            <div className="flex space-x-4">
                                {supportsColorTemp && (
                                    <Slider
                                        value={[colorTempK ?? minTemp]}
                                        min={minTemp}
                                        max={maxTemp}
                                        step={50}
                                        size={30}
                                        orientation="vertical"
                                        rangeClassName="bg-gradient-to-t from-[var(--min-rgb)] to-[var(--max-rgb)]"
                                        onValueChange={(val) => {
                                            setColorTempK(val[0]);
                                            throttledColorTemp(val[0]);
                                            setActiveMode("color_temp"); // force mode switch UI side
                                        }}
                                        className={activeMode !== "color_temp" ? "opacity-40 pointer-events-none" : ""}
                                    />
                                )}
                                <div className="space-y-4 ">
                                    {overrideSupportColorRGB && !rgbColor && (
                                        <div className="h-[calc(100%-3.25rem)]">
                                            <RgbColorPicker
                                                style={{ height: "100%" }}
                                                className="opacity-40 pointer-events-none"
                                            />
                                        </div>
                                    )}
                                    {supportsColor && rgbColor && (
                                        <div className="h-[calc(100%-3.25rem)]">
                                            <RgbColorPicker
                                                color={{
                                                    r: rgbColor[0],
                                                    g: rgbColor[1],
                                                    b: rgbColor[2],
                                                }}
                                                onChange={(c) => {
                                                    const rgb: [number, number, number] = [c.r, c.g, c.b];
                                                    setRgbColor(rgb);
                                                    throttledRgb(rgb);
                                                    setActiveMode("rgb"); // force mode switch UI side
                                                }}
                                                style={{ height: "100%" }}
                                                className={activeMode !== "rgb" ? "opacity-40 pointer-events-none" : ""}
                                            />
                                        </div>
                                    )}
                                    <div className="w-full flex justify-end">
                                        {supportsColor &&
                                            (rgbColor || (overrideSupportColorRGB && !rgbColor)) &&
                                            supportsColorTemp && (
                                                <Button
                                                    onClick={() =>
                                                        setActiveMode(
                                                            activeMode === "color_temp" ? "rgb" : "color_temp"
                                                        )
                                                    }
                                                    className={
                                                        overrideSupportColorRGB && !rgbColor
                                                            ? "opacity-40 pointer-events-none"
                                                            : ""
                                                    }
                                                >
                                                    Switch to {activeMode == "color_temp" ? "RGB" : "Temperature"}
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            ) : (
                <div className="flex space-x-4">
                    {supportsColorTemp && (
                        <Slider
                            value={[colorTempK ?? minTemp]}
                            min={minTemp}
                            max={maxTemp}
                            step={50}
                            size={30}
                            orientation="vertical"
                            rangeClassName="bg-gradient-to-t from-[var(--min-rgb)] to-[var(--max-rgb)]"
                            onValueChange={(val) => {
                                setColorTempK(val[0]);
                                throttledColorTemp(val[0]);
                                setActiveMode("color_temp"); // force mode switch UI side
                            }}
                            className={activeMode !== "color_temp" ? "opacity-40 pointer-events-none" : ""}
                        />
                    )}
                    <div className="space-y-4 flex flex-col justify-end">
                        {overrideSupportColorRGB && !rgbColor && (
                            <div className="h-[calc(100%-3.25rem)]">
                                <RgbColorPicker style={{ height: "100%" }} className="opacity-40 pointer-events-none" />
                            </div>
                        )}
                        {supportsColor && rgbColor && (
                            <div className="h-[calc(100%-3.25rem)]">
                                <RgbColorPicker
                                    color={{
                                        r: rgbColor[0],
                                        g: rgbColor[1],
                                        b: rgbColor[2],
                                    }}
                                    onChange={(c) => {
                                        const rgb: [number, number, number] = [c.r, c.g, c.b];
                                        setRgbColor(rgb);
                                        throttledRgb(rgb);
                                        setActiveMode("rgb"); // force mode switch UI side
                                    }}
                                    style={{ height: "100%" }}
                                    className={activeMode !== "rgb" ? "opacity-40 pointer-events-none" : ""}
                                />
                            </div>
                        )}
                        <div className="w-full flex justify-between">
                            <Button
                                size="icon"
                                onClick={() => {
                                    haWebSocket.callService("light", "toggle", { entity_id: entity });
                                    if (state === "off") {
                                        // preselect a mode when turning on
                                        if (supportsColorTemp) {
                                            setActiveMode("color_temp");
                                        } else if (supportsColor) {
                                            setActiveMode("rgb");
                                        }
                                    }
                                }}
                            >
                                <PowerIcon />
                            </Button>
                            {supportsColor &&
                                (rgbColor || (overrideSupportColorRGB && !rgbColor)) &&
                                supportsColorTemp && (
                                    <Button
                                        onClick={() =>
                                            setActiveMode(activeMode === "color_temp" ? "rgb" : "color_temp")
                                        }
                                        className={
                                            overrideSupportColorRGB && !rgbColor ? "opacity-40 pointer-events-none" : ""
                                        }
                                    >
                                        Switch to {activeMode == "color_temp" ? "RGB" : "Temp"}
                                    </Button>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
