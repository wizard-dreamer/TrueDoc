/**
 * Frontend API configuration.
 *
 * Use `window.TRUEDOC_API_BASE_URL` in a deployed frontend if your backend is hosted
 * at a separate domain from the frontend.
 */
const FALLBACK_API_BASE = "http://127.0.0.1:3000/api";
const DEFAULT_ORIGIN = window.location.protocol.startsWith("http")
    ? `${window.location.origin}/api`
    : FALLBACK_API_BASE;

const API_BASE_URL = String(window.TRUEDOC_API_BASE_URL || DEFAULT_ORIGIN).replace(/\/$/, "");

function buildApiUrl(path = "") {
    const cleanedPath = String(path || "").replace(/^\/*/, "");
    return `${API_BASE_URL}/${cleanedPath}`;
}

window.buildApiUrl = buildApiUrl;
window.API_BASE_URL = API_BASE_URL;
