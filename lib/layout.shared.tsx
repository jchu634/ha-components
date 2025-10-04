import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Logo } from "@/lib/svg";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            title: (
                <>
                    <Logo className="size-10  rounded-full" />
                    HA Components
                </>
            ),
        },
        // see https://fumadocs.dev/docs/ui/navigation/links
        links: [],
        githubUrl: "https://github.com/jchu634/ha-components",
    };
}
