"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RgbColorPicker } from "react-colorful";
import { PowerIcon, SettingsIcon, ThermometerIcon, PaintbrushVerticalIcon, XIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";

export type LightVariants = "Default" | "Accordion" | "Popup" | "SeperatePopups";

export interface LightProps {
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
    activeMode: string | null;
    setActiveMode: (mode: string) => void;
    colorTempK: number | null;
    setColorTempK: (val: number) => void;
    rgbColor: [number, number, number] | null;
    setRgbColor: (rgb: [number, number, number]) => void;
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
    const { colorTempK, setColorTempK, setActiveMode, activeMode, rgbColor, setRgbColor } = props;
    const minRGB = [255, 137, 14];
    const maxRGB = [255, 254, 250];

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
                value={[colorTempK ?? 2000]}
                min={2000}
                max={6500}
                step={50}
                size={30}
                orientation="vertical"
                rangeClassName="bg-gradient-to-t from-[var(--min-rgb)] to-[var(--max-rgb)]"
                onValueChange={(val) => {
                    setColorTempK(val[0]);

                    setActiveMode("color_temp");
                }}
                className={activeMode !== "color_temp" ? "opacity-40 pointer-events-none" : ""}
            />

            <div className="space-y-4 flex flex-col justify-end">
                {rgbColor && (
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
                                setActiveMode("rgb");
                            }}
                            style={{ height: "100%" }}
                            className={activeMode !== "rgb" ? "opacity-40 pointer-events-none" : ""}
                        />
                    </div>
                )}
                <div className="w-full flex justify-between">
                    <Button size="icon">
                        <PowerIcon />
                    </Button>
                    <Button onClick={() => setActiveMode(activeMode === "color_temp" ? "rgb" : "color_temp")}>
                        Switch to {activeMode === "color_temp" ? "RGB" : "Temp"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function HiddenAccordionVariant(props: LightVariantProps) {
    const { colorTempK, setColorTempK, setActiveMode, activeMode, rgbColor, setRgbColor } = props;

    const minRGB = [255, 137, 14];
    const maxRGB = [255, 254, 250];

    return (
        <Accordion type="single" collapsible orientation="horizontal" className="h-100%">
            <AccordionItem value="item-1" orientation="horizontal" className="h-full">
                <div className="flex flex-col h-full justify-between">
                    <AccordionTrigger orientation="horizontal"></AccordionTrigger>
                    <Button size="icon">
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
                        <Slider
                            value={[colorTempK ?? 2000]}
                            min={2000}
                            max={6500}
                            step={50}
                            size={30}
                            orientation="vertical"
                            rangeClassName="bg-gradient-to-t from-[var(--min-rgb)] to-[var(--max-rgb)]"
                            onValueChange={(val) => {
                                setColorTempK(val[0]);

                                setActiveMode("color_temp");
                            }}
                            className={activeMode !== "color_temp" ? "opacity-40 pointer-events-none" : ""}
                        />

                        <div className="space-y-4 flex flex-col justify-end">
                            {rgbColor && (
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
                                            setActiveMode("rgb");
                                        }}
                                        style={{ height: "100%" }}
                                        className={activeMode !== "rgb" ? "opacity-40 pointer-events-none" : ""}
                                    />
                                </div>
                            )}
                            <div className="w-full flex justify-between">
                                <Button
                                    onClick={() => setActiveMode(activeMode === "color_temp" ? "rgb" : "color_temp")}
                                    className="w-full"
                                >
                                    Switch to {activeMode === "color_temp" ? "RGB" : "Temp"}
                                </Button>
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
    const { colorTempK, setColorTempK, setActiveMode, activeMode, rgbColor, setRgbColor } = props;
    const minRGB = [255, 137, 14];
    const maxRGB = [255, 254, 250];

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
                        <div className="safe-to-interact">
                            <Slider
                                value={[colorTempK ?? 2000]}
                                min={2000}
                                max={6500}
                                step={50}
                                size={30}
                                orientation="vertical"
                                rangeClassName="bg-gradient-to-t from-[var(--min-rgb)] to-[var(--max-rgb)]"
                                onValueChange={(val) => {
                                    setColorTempK(val[0]);

                                    setActiveMode("color_temp");
                                }}
                                className={activeMode !== "color_temp" ? "opacity-40 pointer-events-none" : ""}
                            />
                        </div>

                        <div className="safe-to-interact space-y-4">
                            {rgbColor && (
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
                                            setActiveMode("rgb");
                                        }}
                                        style={{ height: "100%" }}
                                        className={activeMode !== "rgb" ? "opacity-40 pointer-events-none" : ""}
                                    />
                                </div>
                            )}
                            <div className="w-full flex justify-end">
                                <Button
                                    onClick={() => setActiveMode(activeMode === "color_temp" ? "rgb" : "color_temp")}
                                >
                                    Switch to {activeMode == "color_temp" ? "RGB" : "Temperature"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <Button size="icon">
                <PowerIcon />
            </Button>
        </div>
    );
}

function SeperatePopupVariant(props: LightVariantProps) {
    const [openColourTemp, setOpenColourTemp] = useState(false);
    const [openColourRGB, setOpenColourRGB] = useState(false);
    const { colorTempK, setColorTempK, setActiveMode, activeMode, rgbColor, setRgbColor } = props;
    const minRGB = [255, 137, 14];
    const maxRGB = [255, 254, 250];

    return (
        <div className="h-100% flex-col flex justify-between">
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
                            value={[colorTempK ?? 2000]}
                            min={2000}
                            max={6500}
                            step={50}
                            size={30}
                            orientation="vertical"
                            rangeClassName="bg-gradient-to-t from-[var(--min-rgb)] to-[var(--max-rgb)]"
                            onValueChange={(val) => {
                                setColorTempK(val[0]);

                                setActiveMode("color_temp");
                            }}
                            className={activeMode !== "color_temp" ? "opacity-40 pointer-events-none" : ""}
                        />
                    </div>
                </PopoverContent>
            </Popover>

            <Popover
                open={openColourRGB}
                modal={false}
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

                    {rgbColor && (
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
                                }}
                                style={{ height: "100%" }}
                                className={activeMode !== "rgb" ? "opacity-40 pointer-events-none" : ""}
                            />
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            <Button size="icon">
                <PowerIcon />
            </Button>
        </div>
    );
}

export function LightPreview({ variant = "Default" }: LightProps) {
    const [brightness, setBrightness] = useState(128);
    const [colorTempK, setColorTempK] = useState<number | null>(null);
    const [rgbColor, setRgbColor] = useState<[number, number, number] | null>(null);
    const [activeMode, setActiveMode] = useState<string | null>(null);

    const VariantMap: Record<LightVariants, React.FC<LightVariantProps>> = {
        Default: DefaultVariant,
        Accordion: HiddenAccordionVariant,
        Popup: PopupVariant,
        SeperatePopups: SeperatePopupVariant,
    };
    const VariantUI = VariantMap[variant];

    // Set Defaults
    useEffect(() => {
        setRgbColor([100, 100, 100]);
        setActiveMode("color_temp");
    }, []);

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
                }}
            />
            <VariantUI
                colorTempK={colorTempK}
                setColorTempK={setColorTempK}
                rgbColor={rgbColor}
                setRgbColor={setRgbColor}
                activeMode={activeMode}
                setActiveMode={setActiveMode}
            />
        </div>
    );
}
