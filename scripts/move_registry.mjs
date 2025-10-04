import fs from "fs";
import path from "path";

const src = path.resolve("registry.json");
const destDir = path.resolve("public", "r");
const dest = path.join(destDir, "registry.json");

fs.mkdirSync(destDir, { recursive: true });

try {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${src} → ${dest}`);
} catch (err) {
    console.error("❌ Failed to copy file:", err);
    process.exit(1);
}
