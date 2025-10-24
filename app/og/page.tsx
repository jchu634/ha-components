import { lexend, funnel } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { LogoBordered, Logo } from "@/lib/svg";

export const alt = "About HAComponents";
export const size = { width: 1200, height: 630 };

export default function OGPage() {
    return (
        <div
            className={cn(
                "relative h-[630px] w-[1200px] overflow-hidden",
                "bg-gradient-to-b from-zinc-950 to-zinc-900 text-white",
            )}
        >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative mx-auto flex h-full w-full items-center justify-center px-12">
                <div className="flex w-[1100px] items-center gap-10">
                    <div className="flex-shrink-0">
                        <LogoBordered className="size-50 text-black opacity-95" />
                    </div>

                    <div className="space-y-4">
                        <h1 className={cn("text-8xl leading-none font-extrabold", lexend.className)}>HA Components</h1>

                        <p className={cn("mt-4 text-5xl text-zinc-300", funnel.className)} style={{ margin: 0 }}>
                            Build your own beautiful <br />
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                Home Assistant
                            </span>{" "}
                            dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
