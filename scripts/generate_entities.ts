import WebSocket from "ws";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

const HA_URL = process.env.HA_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!HA_URL || !AUTH_TOKEN) {
    console.error("Missing HA_URL or AUTH_TOKEN in .env");
    process.exit(1);
}

async function fetchEntities(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://${HA_URL}/api/websocket`);

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
                        access_token: AUTH_TOKEN,
                    })
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

    const tsLines = filtered.map(
        (e) =>
            `  /**\n   * ${e.friendly_name || e.entity_id}\n   */\n  | "${
                e.entity_id
            }"`
    );

    const tsContent = `// AUTO-GENERATED FILE - DO NOT EDIT
export type EntityId =
${tsLines.join("\n")};

export interface HAEntity {
  entity_id: EntityId;
  friendly_name?: string;
}
`;

    const outPath = path.join(process.cwd(), "types/entity-types.ts");
    fs.writeFileSync(outPath, tsContent, "utf-8");
    console.log(`✅ Generated ${outPath}`);
}

generateTypes().catch((err) => {
    console.error("❌ Error generating entities:", err);
    process.exit(1);
});
