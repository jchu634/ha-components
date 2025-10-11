"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Slider } from "@/components/ha-ui/ui/slider";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ha-ui/ui/accordion";
import { RgbColorPicker } from "react-colorful";
import { PowerIcon, SettingsIcon, ThermometerIcon, PaintbrushVerticalIcon, XIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ha-ui/ui/popover";

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
                className={activeMode !== "color_temp" ? "pointer-events-none opacity-40" : ""}
            />

            <div className="flex flex-col justify-end space-y-4">
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
                            className={activeMode !== "rgb" ? "pointer-events-none opacity-40" : ""}
                        />
                    </div>
                )}
                <div className="flex w-full justify-between">
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
                <div className="flex h-full flex-col justify-between">
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
                            className={activeMode !== "color_temp" ? "pointer-events-none opacity-40" : ""}
                        />

                        <div className="flex flex-col justify-end space-y-4">
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
                                        className={activeMode !== "rgb" ? "pointer-events-none opacity-40" : ""}
                                    />
                                </div>
                            )}
                            <div className="flex w-full justify-between">
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
        <div className="h-100% flex flex-col justify-between">
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
                    <div className="flex items-center justify-between py-2 pr-1">
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
                                className={activeMode !== "color_temp" ? "pointer-events-none opacity-40" : ""}
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
                                        className={activeMode !== "rgb" ? "pointer-events-none opacity-40" : ""}
                                    />
                                </div>
                            )}
                            <div className="flex w-full justify-end">
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
        <div className="h-100% flex flex-col justify-between">
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
                    className="w-fit translate-y-[-40%] px-1 pt-1"
                    align="center"
                    side="bottom"
                    sideOffset={0}
                >
                    <div className="flex w-full justify-end">
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
                            className={activeMode !== "color_temp" ? "pointer-events-none opacity-40" : ""}
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
                    className="w-fit translate-y-[-50%] px-1 pt-1"
                    align="center"
                    side="bottom"
                    sideOffset={0}
                >
                    <div className="flex w-full justify-end">
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
                                className={activeMode !== "rgb" ? "pointer-events-none opacity-40" : ""}
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

export default function LightPreview({ variant = "Default" }: LightProps) {
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
