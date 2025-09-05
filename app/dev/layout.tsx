import "@/app/global.css";
import { HomeAssistantProvider } from "@/app/providers/HomeAssistantProvider";
import { Inter } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
});

export default function Layout({ children }: LayoutProps<"/">) {
    return (
        <div className="flex flex-col min-h-screen">
            <HomeAssistantProvider>{children}</HomeAssistantProvider>
        </div>
    );
}
