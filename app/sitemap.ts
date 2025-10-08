// This file configures the sitemap for the Next.js application,
// providing search engines with information about the site's pages.
import type { MetadataRoute } from "next";
import { source } from "@/lib/source"; // fumadocs source

const BASE_URL = "https://hacomponents.keshuac.com";
async function getRegistryEntries() {
    try {
        const res = await fetch(`${BASE_URL}/r/registry.json`);
        const registry = await res.json();

        const items: any[] = registry.items || [];

        return items.map((item) => ({
            url: `${BASE_URL}/r/${item.name}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.4,
        }));
    } catch (error) {
        console.error("Error loading registry.json:", error);
        return [];
    }
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Add documentation pages from fumadocs/source
    const docs = source.getPages().map((page) => ({
        url: `https://hacomponents.keshuac.com${page.url}`,
        lastModified: new Date(), // you could add modifiedFromGit if needed
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    const posts = await getRegistryEntries();

    return [
        {
            url: "https://hacomponents.keshuac.com",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: "https://hacomponents.keshuac.com/docs/showcase",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        ...docs,
        ...posts,
    ];
}
