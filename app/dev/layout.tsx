import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import type { PageProps, LayoutProps } from "fumadocs-core";

export default function Layout({ children }: LayoutProps<"/docs">) {
    return (
        <DocsLayout tree={source.pageTree} {...baseOptions()}>
            {children}
        </DocsLayout>
    );
}
