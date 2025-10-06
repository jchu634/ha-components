"use client";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { BookCopyIcon } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { GHLogoIcon, GHLogoDarkIcon } from "@/lib/svg";

export default function Sidebar() {
    return (
        <div className="font-funnel fixed top-1/2 right-6 hidden h-1/2 w-40 -translate-y-1/2 rounded-4xl bg-[#380222] py-10 shadow-lg md:flex md:flex-col md:items-center md:justify-between dark:bg-[#D5F2E3]">
            <motion.a href="/docs" whileTap={{ scale: 1.05 }} whileHover={{ scale: 1.05 }}>
                <Button className="h-12 w-30 cursor-pointer bg-[#D5F2E3] text-xl font-medium text-black hover:bg-[#D5F2E3] dark:bg-[#380222] dark:text-white">
                    <p>Docs</p>
                    <BookCopyIcon className="size-7" />
                </Button>
            </motion.a>
            <motion.a
                href="https://github.com/jchu634/ha-components"
                whileTap={{ scale: 1.05 }}
                whileHover={{ scale: 1.05 }}
                rel="noreferrer noopener"
                target="_blank"
            >
                <Button className="h-12 w-30 cursor-pointer bg-[#D5F2E3] text-xl font-medium text-black hover:bg-[#D5F2E3] dark:bg-[#380222] dark:text-white">
                    <p>Repo</p>
                    <GHLogoDarkIcon className="block size-7 dark:hidden" />
                    <GHLogoIcon className="hidden size-7 dark:block" />
                </Button>
            </motion.a>
            <motion.a href="/" whileTap={{ scale: 1.05 }} whileHover={{ scale: 1.05 }}>
                <Button className="h-12 w-30 cursor-pointer bg-[#11dd74] text-xl font-medium text-black hover:bg-[#11dd74] dark:bg-[#3a045e] dark:text-white">
                    <p>Layout 1</p>
                </Button>
            </motion.a>
            <motion.a href="/" whileTap={{ scale: 1.05 }} whileHover={{ scale: 1.05 }}>
                <Button className="h-12 w-30 cursor-pointer bg-[#11dd74] text-xl font-medium text-black hover:bg-[#11dd74] dark:bg-[#3a045e] dark:text-white">
                    <p>Layout 2</p>
                </Button>
            </motion.a>
            <ThemeToggle className="bg-background text-foreground hover:text-background hover:bg-foreground h-12 w-30 cursor-pointer text-xl font-medium" />
        </div>
    );
}
