"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    size?: number | string;
    rangeClassName?: string;
}

function Slider({
    className,
    defaultValue,
    value,
    size = 100,
    min = 0,
    max = 100,
    rangeClassName,
    ...props
}: SliderProps) {
    const _values = React.useMemo(
        () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
        [value, defaultValue, min, max],
    );

    return (
        <SliderPrimitive.Root
            data-slot="slider"
            defaultValue={defaultValue}
            value={value}
            min={min}
            max={max}
            className={cn(
                "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
                className,
            )}
            style={{ ["--slider-width" as any]: typeof size === "number" ? `${size}px` : size }}
            {...props}
        >
            <SliderPrimitive.Track
                data-slot="slider-track"
                className={cn(
                    "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-[var(--slider-width)] data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-[var(--slider-width)]",
                    // allow caller to override / extend range styling (eg. gradient for color temp)
                    rangeClassName,
                )}
            >
                <SliderPrimitive.Range
                    data-slot="slider-range"
                    className={cn(
                        "bg-primary absolute",
                        // horizontally

                        "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
                        // allow caller to override / extend range styling (eg. gradient for color temp)
                        rangeClassName,
                    )}
                />
            </SliderPrimitive.Track>
            {Array.from({ length: _values.length }, (_, index) => (
                <SliderPrimitive.Thumb
                    data-slot="slider-thumb"
                    key={index}
                    className={cn(
                        "block shrink-0 bg-indigo-950 shadow-sm",
                        "ring-ring/50 transition-[color,box-shadow]",
                        "hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden",
                        "disabled:pointer-events-none disabled:opacity-50",

                        // Horizontal slider → vertical line (thin width, tall height)
                        "data-[orientation=horizontal]:h-[calc(var(--slider-width)/2)] data-[orientation=horizontal]:w-[6px] data-[orientation=horizontal]:-translate-y-1/2",

                        // Vertical slider → horizontal line (thin height, wide width)
                        "data-[orientation=vertical]:-translate-x-50% data-[orientation=vertical]:translate-y-50% rounded outline-1 outline-white data-[orientation=vertical]:h-[6px] data-[orientation=vertical]:w-[calc(var(--slider-width)/1.5)]",
                    )}
                ></SliderPrimitive.Thumb>
            ))}
        </SliderPrimitive.Root>
    );
}

export { Slider };
