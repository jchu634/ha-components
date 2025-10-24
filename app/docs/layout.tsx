import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
    return (
        <DocsLayout tree={source.pageTree} {...baseOptions()}>
            {children}
        </DocsLayout>
    );
}
export const metadata = {
    openGraph: {
        title: "HA Components Docs",
        description: "Build your own beautiful Home Assistant dashboard.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "HA Components",
            },
        ],
    },
};
