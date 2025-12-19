import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { lexend } from "@/lib/fonts";

export default function Layout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={lexend.className} suppressHydrationWarning>
            <body className="flex min-h-screen flex-col">
                <RootProvider>{children}</RootProvider>
            </body>
        </html>
    );
}
