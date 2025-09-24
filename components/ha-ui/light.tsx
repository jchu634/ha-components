"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RgbColorPicker } from "react-colorful";
import { PowerIcon, SettingsIcon, ThermometerIcon, PaintbrushVerticalIcon, XIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";

import type { EntityId } from "@/types/entity-types";
import { haWebSocket } from "@/lib/haWebsocket";

export type LightVariants = "Default" | "Accordion" | "Popup" | "SeperatePopups";

export interface LightProps {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
    /**
     * Shows the RGB Colour Picker despite what Home Assistant Claims
     */
    overrideSupportColorRGB?: boolean;
    /**
     * Variant of controls UI
     */
    variant?: LightVariants;
}

// Common props passed to all variant UIs
interface LightVariantProps {
    state: string;
    activeMode: string | null;
    setActiveMode: (mode: string) => void;
    supportsColor: boolean;
    supportsColorTemp: boolean;
    rgbColor: [number, number, number] | null;
    setRgbColor: (rgb: [number, number, number]) => void;
    colorTempK: number | null;
    setColorTempK: (val: number) => void;
    minTemp: number;
    maxTemp: number;
    throttledColorTemp: (val: number) => void;
    throttledRgb: (rgb: [number, number, number]) => void;
    overrideSupportColorRGB: boolean;
    entity: EntityId;
}

// ---------- Utility Functions ----------
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

// ---------- Variant Components ----------
function DefaultVariant(props: LightVariantProps) {
    const {
        supportsColorTemp,
        colorTempK,
        minTemp,
        maxTemp,
        setColorTempK,
        throttledColorTemp,
        setActiveMode,
        activeMode,
        overrideSupportColorRGB,
        rgbColor,
        supportsColor,
        setRgbColor,
        throttledRgb,
        entity,
        state,
    } = props;
    const minRGB = kelvinToRGB(minTemp);
    const maxRGB = kelvinToRGB(maxTemp);

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
                        setActiveMode("color_temp");
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
                                setActiveMode("rgb");
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
                                if (supportsColorTemp) setActiveMode("color_temp");
                                else if (supportsColor) setActiveMode("rgb");
                            }
                        }}
                    >
                        <PowerIcon />
                    </Button>
                    {supportsColor && (rgbColor || overrideSupportColorRGB) && supportsColorTemp && (
                        <Button
                            onClick={() => setActiveMode(activeMode === "color_temp" ? "rgb" : "color_temp")}
                            className={overrideSupportColorRGB && !rgbColor ? "opacity-40 pointer-events-none" : ""}
                        >
                            Switch to {activeMode === "color_temp" ? "RGB" : "Temp"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function HiddenAccordionVariant(props: LightVariantProps) {
    const {
        supportsColorTemp,
        colorTempK,
        minTemp,
        maxTemp,
        setColorTempK,
        throttledColorTemp,
        setActiveMode,
        activeMode,
        overrideSupportColorRGB,
        rgbColor,
        supportsColor,
        setRgbColor,
        throttledRgb,
        entity,
        state,
    } = props;

    const minRGB = kelvinToRGB(minTemp);
    const maxRGB = kelvinToRGB(maxTemp);

    return (
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
                    <div
                        className="flex space-x-4"
                        style={
                            {
                                "--min-rgb": `rgb(${minRGB.join(",")})`,
                                "--max-rgb": `rgb(${maxRGB.join(",")})`,
                            } as React.CSSProperties
                        }
                    >
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
                                {supportsColor && (rgbColor || overrideSupportColorRGB) && supportsColorTemp && (
                                    <Button
                                        onClick={() =>
                                            setActiveMode(activeMode === "color_temp" ? "rgb" : "color_temp")
                                        }
                                        className={
                                            overrideSupportColorRGB && !rgbColor
                                                ? "opacity-40 pointer-events-none w-full"
                                                : "w-full"
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
    );
}

function PopupVariant(props: LightVariantProps) {
    const [open, setOpen] = useState(false);
    const {
        supportsColorTemp,
        colorTempK,
        minTemp,
        maxTemp,
        setColorTempK,
        throttledColorTemp,
        setActiveMode,
        activeMode,
        overrideSupportColorRGB,
        rgbColor,
        supportsColor,
        setRgbColor,
        throttledRgb,
        entity,
        state,
    } = props;
    const minRGB = kelvinToRGB(minTemp);
    const maxRGB = kelvinToRGB(maxTemp);

    return (
        <div className="h-100% flex-col flex justify-between">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button size="icon" variant="secondary">
                        <SettingsIcon className="size-6" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-fit translate-y-[-40%] pt-0 pr-0"
                    align="center"
                    side="bottom"
                    sideOffset={0}
                >
                    <div className="flex justify-between items-center py-2 pr-1">
                        <h3>Light Controls</h3>
                        <PopoverClose asChild>
                            <Button size="icon" variant="ghost" className="group">
                                <XIcon className="size-4 transition-transform duration-200 group-hover:scale-125" />
                            </Button>
                        </PopoverClose>
                    </div>
                    <div
                        className="safe-to-interact flex space-x-4 pr-4"
                        style={
                            {
                                "--min-rgb": `rgb(${minRGB.join(",")})`,
                                "--max-rgb": `rgb(${maxRGB.join(",")})`,
                            } as React.CSSProperties
                        }
                    >
                        {supportsColorTemp && (
                            <div className="safe-to-interact">
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
                                        setActiveMode("color_temp");
                                    }}
                                    className={activeMode !== "color_temp" ? "opacity-40 pointer-events-none" : ""}
                                />
                            </div>
                        )}

                        <div className="safe-to-interact space-y-4">
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
                                {supportsColor && (rgbColor || overrideSupportColorRGB) && supportsColorTemp && (
                                    <Button
                                        onClick={() =>
                                            setActiveMode(activeMode === "color_temp" ? "rgb" : "color_temp")
                                        }
                                        className={
                                            overrideSupportColorRGB && !rgbColor ? "opacity-40 pointer-events-none" : ""
                                        }
                                    >
                                        Switch to {activeMode == "color_temp" ? "RGB" : "Temperature"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
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
    );
}

function SeperatePopupVariant(props: LightVariantProps) {
    const [openColourTemp, setOpenColourTemp] = useState(false);
    const [openColourRGB, setOpenColourRGB] = useState(false);
    const {
        supportsColorTemp,
        colorTempK,
        minTemp,
        maxTemp,
        setColorTempK,
        throttledColorTemp,
        setActiveMode,
        activeMode,
        overrideSupportColorRGB,
        rgbColor,
        supportsColor,
        setRgbColor,
        throttledRgb,
        entity,
        state,
    } = props;

    const minRGB = kelvinToRGB(minTemp);
    const maxRGB = kelvinToRGB(maxTemp);

    return (
        <div className="h-100% flex-col flex justify-between">
            {supportsColorTemp && (
                <Popover
                    open={openColourTemp}
                    onOpenChange={(open) => {
                        setOpenColourTemp(open);
                        setActiveMode("color_temp");
                    }}
                >
                    <PopoverTrigger asChild>
                        <Button size="icon" variant="secondary">
                            <ThermometerIcon className="size-6" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent
                        className="w-fit translate-y-[-40%] pt-1 px-1"
                        align="center"
                        side="bottom"
                        sideOffset={0}
                    >
                        <div className="flex justify-end w-full">
                            <PopoverClose asChild>
                                <Button size="icon" variant="ghost" className="group">
                                    <XIcon className="size-4 transition-transform duration-200 group-hover:scale-125" />
                                </Button>
                            </PopoverClose>
                        </div>

                        <div
                            className="safe-to-interact px-13 pb-3"
                            style={
                                {
                                    "--min-rgb": `rgb(${minRGB.join(",")})`,
                                    "--max-rgb": `rgb(${maxRGB.join(",")})`,
                                } as React.CSSProperties
                            }
                        >
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
                                }}
                                className={activeMode !== "color_temp" ? "opacity-40 pointer-events-none" : ""}
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {supportsColor && (rgbColor || overrideSupportColorRGB) && (
                <Popover
                    open={openColourRGB}
                    onOpenChange={(open) => {
                        setOpenColourRGB(open);
                        setActiveMode("rgb");
                    }}
                >
                    <PopoverTrigger asChild>
                        <Button size="icon" variant="secondary">
                            <PaintbrushVerticalIcon className="size-6" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent
                        className="w-fit translate-y-[-50%] pt-1 px-1"
                        align="center"
                        side="bottom"
                        sideOffset={0}
                    >
                        <div className="flex justify-end w-full">
                            <PopoverClose asChild>
                                <Button size="icon" variant="ghost" className="group">
                                    <XIcon className="size-4 transition-transform duration-200 group-hover:scale-125" />
                                </Button>
                            </PopoverClose>
                        </div>
                        {overrideSupportColorRGB && !rgbColor && (
                            <div className="safe-to-interact">
                                <RgbColorPicker style={{ height: "100%" }} className="opacity-40 pointer-events-none" />
                            </div>
                        )}
                        {supportsColor && rgbColor && (
                            <div className="h-48 px-7 pb-4">
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
                                    }}
                                    style={{ height: "100%" }}
                                    className={activeMode !== "rgb" ? "opacity-40 pointer-events-none" : ""}
                                />
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            )}
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
    );
}

export function Light({ entity, overrideSupportColorRGB = false, variant = "Default" }: LightProps) {
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

    const VariantMap: Record<LightVariants, React.FC<LightVariantProps>> = {
        Default: DefaultVariant,
        Accordion: HiddenAccordionVariant,
        Popup: PopupVariant,
        SeperatePopups: SeperatePopupVariant,
    };
    const VariantUI = VariantMap[variant];

    return (
        <div className="flex space-x-4">
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
            <VariantUI
                entity={entity}
                overrideSupportColorRGB={overrideSupportColorRGB}
                supportsColor={supportsColor}
                supportsColorTemp={supportsColorTemp}
                minTemp={minTemp}
                maxTemp={maxTemp}
                colorTempK={colorTempK}
                setColorTempK={setColorTempK}
                rgbColor={rgbColor}
                setRgbColor={setRgbColor}
                activeMode={activeMode}
                setActiveMode={setActiveMode}
                throttledColorTemp={throttledColorTemp}
                throttledRgb={throttledRgb}
                state={state}
            />
        </div>
    );
}
