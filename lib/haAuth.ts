const HA_HOST = process.env.NEXT_PUBLIC_HA_URL;
const HA_PORT = process.env.NEXT_PUBLIC_HA_PORT;
const HA_HTTP_URL = `http://${HA_HOST}:${HA_PORT}`;

const CLIENT_ID = process.env.NEXT_PUBLIC_HA_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_HA_REDIRECT_URI!;

// Optional long-lived token override
const LONG_LIVED_TOKEN = process.env.NEXT_PUBLIC_HA_LONG_LIVED_TOKEN;

type Tokens = {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type: string;
    created_at: number;
};

function saveTokens(tokens: any) {
    const data: Tokens = {
        ...tokens,
        created_at: Date.now(),
    };
    localStorage.setItem("ha_tokens", JSON.stringify(data));
}

function loadTokens(): Tokens | null {
    const raw = localStorage.getItem("ha_tokens");
    return raw ? (JSON.parse(raw) as Tokens) : null;
}

export function clearTokens() {
    localStorage.removeItem("ha_tokens");
}

export function login() {
    if (LONG_LIVED_TOKEN) {
        console.warn("Using long-lived token override, skipping OAuth2 login");
        return;
    }
    const authUrl = `${HA_HTTP_URL}/auth/authorize?response_type=code&client_id=${encodeURIComponent(
        CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = authUrl;
}

export async function exchangeCodeForToken(code: string) {
    const res = await fetch(`${HA_HTTP_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
        }),
    });

    if (!res.ok) throw new Error("Token exchange failed");
    const data = await res.json();
    saveTokens(data);
    return data;
}

export async function refreshAccessToken() {
    const tokens = loadTokens();
    if (!tokens?.refresh_token) throw new Error("No refresh token available");

    const res = await fetch(`${HA_HTTP_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: tokens.refresh_token,
            client_id: CLIENT_ID,
        }),
    });

    if (!res.ok) throw new Error("Refresh token failed");
    const data = await res.json();
    saveTokens(data);
    return data;
}

export function getAccessToken() {
    if (LONG_LIVED_TOKEN) return LONG_LIVED_TOKEN;

    const tokens = loadTokens();
    if (!tokens) return null;

    if (tokens.expires_in) {
        const expiresAt = tokens.created_at + tokens.expires_in * 1000;
        if (Date.now() > expiresAt) {
            return null; // expired
        }
    }

    return tokens.access_token;
}

export function getRefreshToken() {
    const tokens = loadTokens();
    return tokens?.refresh_token || null;
}
