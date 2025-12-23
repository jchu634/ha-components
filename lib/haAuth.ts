/**
 * Home Assistant Authentication Utility
 *
 * Supports OAuth2 token exchange, refresh, persistent storage in localStorage,
 * and an optional long-lived token override (NEXT_PUBLIC_HA_LONG_LIVED_TOKEN).
 */

export const ENV = {
    // @ts-ignore - import.meta may not exist in Next
    HA_HOST: typeof process !== "undefined" ? process.env.NEXT_PUBLIC_HA_URL : import.meta.env.VITE_HA_URL, // e.g. homeassistant.local

    // @ts-ignore - import.meta may not exist in Next
    HA_PORT: typeof process !== "undefined" ? process.env.NEXT_PUBLIC_HA_PORT : import.meta.env.VITE_HA_PORT, // e.g. 8123

    // OAuth2 app credentials (must match Home Assistant config)
    CLIENT_ID:
        // @ts-ignore - import.meta may not exist in Next
        typeof process !== "undefined" ? process.env.NEXT_PUBLIC_HA_CLIENT_ID : import.meta.env.VITE_HA_CLIENT_ID,

    // Optional override: if set, skip OAuth2
    LONG_LIVED_TOKEN:
        typeof process !== "undefined"
            ? process.env.NEXT_PUBLIC_HA_LONG_LIVED_TOKEN
            : // @ts-ignore - import.meta may not exist in Next
              import.meta.env.VITE_HA_LONG_LIVED_TOKEN,

    PROXY_URL:
        typeof process !== "undefined"
            ? process.env.NEXT_PUBLIC_PROXY_URL
            : // @ts-ignore - import.meta may not exist in Next
              import.meta.env.VITE_PROXY_URL,
};

// Validate required environment variables at module load
const requiredEnvVars = [
    { key: "HA_HOST", value: ENV.HA_HOST },
    { key: "HA_PORT", value: ENV.HA_PORT },
    { key: "CLIENT_ID", value: ENV.CLIENT_ID },
];

const missingVars = requiredEnvVars.filter(({ value }) => !value);
if (missingVars.length > 0) {
    const missing = missingVars.map(({ key }) => key).join(", ");
    throw new Error(
        `Missing required environment variables: ${missing}. ` +
            `Please set NEXT_PUBLIC_* or VITE_* prefixed versions.`,
    );
}

const HA_HTTP_URL = `http://${ENV.HA_HOST}:${ENV.HA_PORT}`;

// Only log in development
if (process.env.NODE_ENV === "development") {
    console.log("[HA AUTH] Configuration:", {
        HA_HOST: ENV.HA_HOST,
        HA_PORT: ENV.HA_PORT,
        CLIENT_ID: ENV.CLIENT_ID,
        hasLongLivedToken: !!ENV.LONG_LIVED_TOKEN, // Don't log the actual token
    });
}

const STORAGE_KEY = "ha_tokens";

export type Tokens = {
    access_token: string;
    refresh_token?: string;
    expires_in?: number; // in seconds
    token_type: string;
    created_at: number; // epoch ms
};

function log(...args: any[]) {
    console.log("[HA AUTH]", ...args);
}

/**
 * Save tokens into localStorage (with created_at timestamp).
 */
export function saveTokens(tokens: any) {
    const data: Tokens = {
        ...tokens,
        created_at: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    log("Saved tokens to localStorage:", {
        access_token: !!data.access_token,
        refresh_token: !!data.refresh_token,
        expires_in: data.expires_in,
    });
}

/**
 * Load tokens from localStorage.
 */
export function loadTokens(): Tokens | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Tokens) : null;
    } catch {
        return null;
    }
}

/**
 * Clear stored tokens.
 */
export function clearTokens() {
    localStorage.removeItem(STORAGE_KEY);
    log("Cleared tokens");
}

/**
 * Redirect to Home Assistant OAuth2 login.
 */
export function login() {
    if (ENV.LONG_LIVED_TOKEN) {
        log("Using long-lived token; skipping OAuth login");
        return;
    }
    const authUrl =
        `${HA_HTTP_URL}/auth/authorize?response_type=code` +
        `&client_id=${encodeURIComponent(ENV.CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(window.location.href)}`;

    log("Redirecting to HA login:", authUrl);

    window.location.href = authUrl;
}

/**
 * Exchange authorization code for access + refresh tokens.
 */
export async function exchangeCodeForToken(code: string) {
    log("Exchanging code for token");
    const res = await fetch(`${HA_HTTP_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: ENV.CLIENT_ID,
            redirect_uri: window.location.href,
        }),
    });

    const text = await res.text();
    if (!res.ok) {
        log("Token exchange failed:", res.status, text);
        throw new Error(`Token exchange failed: ${res.status}`);
    }
    const data = JSON.parse(text);
    saveTokens(data);
    return data as Tokens;
}

/**
 * Refresh access token using stored refresh token.
 */
export async function refreshAccessToken() {
    const tokens = loadTokens();
    if (!tokens?.refresh_token) throw new Error("No refresh token available");

    log("Refreshing access token...");
    const res = await fetch(`${HA_HTTP_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: tokens.refresh_token,
            client_id: ENV.CLIENT_ID,
        }),
    });

    const text = await res.text();
    if (!res.ok) {
        log("Refresh failed:", res.status, text);
        throw new Error(`Refresh failed: ${res.status}`);
    }
    const data = JSON.parse(text);
    saveTokens(data);
    log("Refresh successful; new access token saved");
    return data as Tokens;
}

/**
 * Get current access token (returns null if expired or missing).
 */
export function getAccessToken(): string | null {
    if (ENV.LONG_LIVED_TOKEN) return ENV.LONG_LIVED_TOKEN;

    const t = loadTokens();
    if (!t) return null;

    if (!t.expires_in) return t.access_token;

    const expiresAt = t.created_at + t.expires_in * 1000;
    if (Date.now() >= expiresAt) {
        log("Access token expired");
        return null;
    }
    return t.access_token;
}

/**
 * Get time (ms) until current access token expires.
 */
export function getTimeToExpiryMs(): number | null {
    const t = loadTokens();
    if (!t?.expires_in) return null;
    return t.created_at + t.expires_in * 1000 - Date.now();
}

/**
 * Force a refresh now (useful for debugging).
 */
export async function forceRefreshNow() {
    return refreshAccessToken();
}
