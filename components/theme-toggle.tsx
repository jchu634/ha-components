import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className, ...props }: any) {
    const { theme, setTheme } = useTheme();

    return (
        <motion.div whileTap={{ scale: 1.05 }} whileHover={{ scale: 1.05 }}>
            <Button
                onClick={() => setTheme(theme == "dark" ? "theme-light" : "dark")}
                className={`group ${className ?? ""}`}
                {...props}
            >
                <p>Theme</p>
                {/* Icon changing on hover disabled as it was too distracting */}
                <Sun
                    className={cn(
                        "block size-7 transition-all dark:hidden",
                        // "group-hover:hidden dark:group-hover:block",
                    )}
                />
                <Moon
                    className={cn(
                        "hidden size-7 transition-all dark:block",
                        // "group-hover:block dark:group-hover:hidden",
                    )}
                />
            </Button>
        </motion.div>
    );
}
