import WebSocket from "ws";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

function getImportMetaEnv(key: string): string | undefined {
    try {
        // @ts-ignore - import.meta may not exist in Next
        return typeof import.meta !== "undefined" ? import.meta.env?.[key] : undefined;
    } catch {
        return undefined;
    }
}

const HA_URL = getImportMetaEnv("VITE_HA_URL") || process.env.NEXT_PUBLIC_HA_URL || process.env.HA_URL; // e.g. homeassistant.local
const HA_PORT = getImportMetaEnv("VITE_HA_PORT") || process.env.NEXT_PUBLIC_HA_PORT || process.env.HA_PORT; // e.g. 8123
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const FRAMEWORK_AUTH_TOKEN =
    getImportMetaEnv("VITE_API_URL") || process.env.NEXT_PUBLIC_HA_LONG_LIVED_TOKEN || process.env.LONG_LIVED_TOKEN;

if (!HA_URL || (!AUTH_TOKEN && !FRAMEWORK_AUTH_TOKEN)) {
    console.error("Missing HA_URL or AUTH_TOKEN in .env");
    process.exit(1);
}

async function fetchEntities(): Promise<any[]> {
    const TOKEN =
        AUTH_TOKEN != null && AUTH_TOKEN !== ""
            ? AUTH_TOKEN
            : FRAMEWORK_AUTH_TOKEN != null && FRAMEWORK_AUTH_TOKEN !== ""
              ? FRAMEWORK_AUTH_TOKEN
              : undefined;
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://${HA_URL}:${HA_PORT}/api/websocket`);

        ws.on("open", () => {
            console.log("Connected to Home Assistant WebSocket");
        });

        let authed = false;

        ws.on("message", (data: string) => {
            const msg = JSON.parse(data);

            if (msg.type === "auth_required") {
                ws.send(
                    JSON.stringify({
                        type: "auth",
                        access_token: TOKEN,
                    }),
                );
            } else if (msg.type === "auth_ok") {
                authed = true;
                ws.send(JSON.stringify({ id: 1, type: "get_states" }));
            } else if (msg.type === "result" && authed) {
                if (msg.success) {
                    resolve(msg.result);
                } else {
                    reject(new Error("Failed to fetch entities"));
                }
                ws.close();
            }
        });

        ws.on("error", (err: string) => reject(err));
    });
}

async function generateTypes() {
    const entities = await fetchEntities();

    const filtered = entities.map((e: any) => ({
        entity_id: e.entity_id,
        friendly_name: e.attributes?.friendly_name,
    }));

    const tsLines = filtered.map((e) => `  /**\n   * ${e.friendly_name || e.entity_id}\n   */\n  | "${e.entity_id}"`);

    const tsContent = `// AUTO-GENERATED FILE - DO NOT EDIT
export type EntityId =
${tsLines.join("\n")};

export interface HAEntity {
  entity_id: EntityId;
  friendly_name?: string;
}
`;

    // TODO FETCH DOMAINS AND SERVICES

    const outPath = path.join(process.cwd(), "types/entity-types.ts");
    fs.writeFileSync(outPath, tsContent, "utf-8");
    console.log(`✅ Generated ${outPath}`);
}

generateTypes().catch((err) => {
    console.error("❌ Error generating entities:", err);
    process.exit(1);
});
