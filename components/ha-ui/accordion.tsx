"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({
    orientation = "vertical",
    className,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & {
    orientation?: "vertical" | "horizontal";
}) {
    return (
        <AccordionPrimitive.Root
            data-orientation={orientation}
            className={cn(orientation === "horizontal" ? "flex flex-col" : "flex flex-col", className)}
            {...props}
        />
    );
}

function AccordionItem({
    className,
    orientation = "vertical",
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item> & {
    orientation?: "vertical" | "horizontal";
}) {
    return (
        <AccordionPrimitive.Item
            data-orientation={orientation}
            className={cn(
                orientation === "horizontal"
                    ? "flex flex-row items-start border-r border-b-0 last:border-r-0"
                    : "flex flex-col border-b last:border-b-0",
                className,
            )}
            {...props}
        />
    );
}

function AccordionTrigger({
    className,
    children,
    orientation = "vertical",
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
    orientation?: "vertical" | "horizontal";
}) {
    const iconRotation = "[&[data-state=open]>svg]:rotate-180";

    return (
        <AccordionPrimitive.Header className={cn(orientation === "horizontal" ? "flex-shrink-0" : "w-full")}>
            <AccordionPrimitive.Trigger
                data-orientation={orientation}
                className={cn(
                    "focus-visible:border-ring focus-visible:ring-ring/50 bg-secondary flex items-center gap-2 rounded-md text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
                    orientation === "horizontal" ? "flex-row px-2 py-2 outline-4" : "w-full justify-between py-4",
                    iconRotation,
                    className,
                )}
                {...props}
            >
                {children}

                <ChevronRightIcon className="text-muted-foreground size-4 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

function AccordionContent({
    className,
    children,
    orientation = "vertical",
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> & {
    orientation?: "vertical" | "horizontal";
}) {
    return (
        <AccordionPrimitive.Content
            data-orientation={orientation}
            className={cn(
                "overflow-hidden text-sm",
                orientation === "vertical" &&
                    "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
                orientation === "horizontal" &&
                    "data-[state=closed]:animate-accordion-left data-[state=open]:animate-accordion-right",
            )}
            {...props}
        >
            <div className={cn(orientation === "horizontal" ? "px-4 py-2" : "pt-0 pb-4", className)}>{children}</div>
        </AccordionPrimitive.Content>
    );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
