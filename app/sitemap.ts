// This file configures the sitemap for the Next.js application,
// providing search engines with information about the site's pages.
import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { source } from "@/lib/source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const registryDirectory = path.join(process.cwd(), "public/r");
    const filenames = fs.readdirSync(registryDirectory);

    const postPromises = filenames
        .filter((filename) => filename.endsWith(".json"))
        .map(async (filename) => {
            const slug = filename.replace(/\.json$/, "");

            return {
                url: `https://hacomponents.keshuac.com/r/${slug}`,
                lastModified: new Date(),
                changeFrequency: "monthly" as const,
                priority: 0.2,
            };
        });

    const posts = await Promise.all(postPromises);

    // Add documentation pages from fumadocs/source
    const docs = source.getPages().map((page) => {
        // page.url is already built with the loader's baseUrl (e.g. "/docs/...")
        const url = `https://hacomponents.keshuac.com${page.url}`;

        // try to get file mtime for lastModified if absolutePath is available
        let lastModified = new Date();
        try {
            if (page.absolutePath) {
                const stats = fs.statSync(page.absolutePath);
                lastModified = stats.mtime;
            }
        } catch (e) {
            // fallback to now
        }

        return {
            url,
            lastModified,
            changeFrequency: "monthly" as const,
            priority: 0.6,
        };
    });

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
        ...posts.filter((post) => post !== null),
    ];
}
