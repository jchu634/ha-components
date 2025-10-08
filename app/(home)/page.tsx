"use client";

import Link from "next/link";
import { lexend, funnel } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Logo } from "@/lib/svg";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Palette, Zap } from "lucide-react";
import { GHLogoDarkIcon, GHLogoIcon } from "@/lib/svg";
import CameraPreview from "@/components/docs/camera-preview";
import LightPreview from "@/components/docs/light-preview";
import TogglePreview from "@/components/docs/toggle-preview";
import ThemeToggle from "@/components/theme-toggle";

export default function Home() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
                <nav className="mb-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="size-10 opacity-90" />
                        <span className={cn("text-xl font-bold text-zinc-900 dark:text-white", lexend.className)}>
                            HA Components
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            <GHLogoIcon className="hidden size-4 dark:block" />
                            <GHLogoDarkIcon className="size-4 dark:hidden" />
                            <span className="hidden sm:inline">GitHub</span>
                        </a>
                        <ThemeToggle variant="outline" size="icon" />
                    </div>
                </nav>

                <section className="mb-24 flex flex-col space-y-8">
                    <h1
                        className={cn(
                            "max-w-4xl text-6xl font-bold tracking-tight text-zinc-900 sm:text-7xl dark:text-white",
                            lexend.className,
                        )}
                    >
                        Build Beautiful{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            Home Assistant
                        </span>{" "}
                        Dashboards
                    </h1>

                    <p
                        className={cn(
                            "max-w-2xl text-xl leading-relaxed text-zinc-600 dark:text-zinc-400",
                            funnel.className,
                        )}
                    >
                        Free and open-source components that give you complete control. Copy, paste, and customize to
                        create the perfect smart home interface.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button asChild size="lg" className="group gap-2 text-base">
                            <Link href="/docs">
                                Get Started
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="gap-2 text-base">
                            <Link href="/docs/showcase">View Showcase</Link>
                        </Button>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                        <span>MIT Licensed</span>
                    </div>
                </section>

                <section className="mt-32 grid gap-8 sm:grid-cols-3">
                    <FeatureCard
                        icon={<Code2 className="size-6" />}
                        title="Full Source Control"
                        description="Copy the source code directly into your project. No hidden dependencies or black boxes."
                    />
                    <FeatureCard
                        icon={<Palette className="size-6" />}
                        title="Fully Customizable"
                        description="Built with Tailwind CSS and shadcn/ui. Style and modify components to match your vision."
                    />
                    <FeatureCard
                        icon={<Zap className="size-6" />}
                        title="Ready to Use"
                        description="Pre-built components for lights, cameras, switches, and more. Start building immediately."
                    />
                </section>

                <section className="mt-32">
                    <div className="mb-12">
                        <h2 className={cn("text-4xl font-bold text-zinc-900 dark:text-white", lexend.className)}>
                            See It In Action
                        </h2>
                        <p className={cn("mt-4 text-lg text-zinc-600 dark:text-zinc-400", funnel.className)}>
                            Interactive components that work seamlessly with Home Assistant
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        <ComponentShowcase
                            title="Camera Controls"
                            description="Live camera feeds with built-in controls and smooth playback"
                        >
                            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <CameraPreview autoPlay={true} />
                            </div>
                        </ComponentShowcase>

                        <ComponentShowcase
                            title="Light Controls"
                            description="Intuitive brightness and color controls for your smart lights"
                        >
                            <div className="flex h-[20rem] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
                                <LightPreview />
                            </div>
                        </ComponentShowcase>

                        <ComponentShowcase
                            title="Toggle Switches"
                            description="Clean, accessible switches for all your devices"
                        >
                            <div className="flex h-[12rem] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
                                <TogglePreview />
                            </div>
                        </ComponentShowcase>

                        <ComponentShowcase
                            title="And More"
                            description="Curtains, triggers, sensors, and custom components"
                        >
                            <div className="flex h-[12rem] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50/50 p-12 dark:border-zinc-800 dark:bg-zinc-900/70">
                                <div className="text-center">
                                    <Code2 className="mx-auto mb-4 size-12 text-zinc-400" />
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Build your own components with our flexible API
                                    </p>
                                </div>
                            </div>
                        </ComponentShowcase>
                    </div>
                </section>

                <section className="mt-32 rounded-2xl border border-zinc-200 bg-white/50 p-12 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                    <h2 className={cn("text-4xl font-bold text-zinc-900 dark:text-white", lexend.className)}>
                        Ready to Get Started?
                    </h2>
                    <p className={cn("mt-4 max-w-5xl text-lg text-zinc-600 dark:text-zinc-400", funnel.className)}>
                        Follow our installation guide and start building your custom Home Assistant dashboard in
                        minutes.
                    </p>
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <Button asChild size="lg" className="group gap-2">
                            <Link href="/docs/installation/installation">
                                Read Documentation
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/docs/advanced/create-your-own">Create Your Own</Link>
                        </Button>
                    </div>
                </section>

                <footer className="mt-24 border-t border-zinc-200 pt-12 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                    <p>Created by Joshua Chung (JCHU634). MIT Licensed.</p>
                </footer>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="group rounded-xl border border-zinc-200 bg-white/50 p-8 backdrop-blur-sm transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700">
            <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-950 dark:text-blue-400">
                {icon}
            </div>
            <h3 className={cn("mb-2 text-xl font-semibold text-zinc-900 dark:text-white", lexend.className)}>
                {title}
            </h3>
            <p className={cn("text-zinc-600 dark:text-zinc-400", funnel.className)}>{description}</p>
        </div>
    );
}

function ComponentShowcase({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className={cn("text-xl font-semibold text-zinc-900 dark:text-white", lexend.className)}>{title}</h3>
                <p className={cn("mt-1 text-sm text-zinc-600 dark:text-zinc-400", funnel.className)}>{description}</p>
            </div>
            {children}
        </div>
    );
}
