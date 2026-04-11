/**
 * Frontend API configuration.
 *
 * Use `window.TRUEDOC_API_BASE_URL` in a deployed frontend if your backend is hosted
 * at a separate domain from the frontend.
 */
const API_BASE_URL = "https://truedoc-plep.onrender.com";

function buildApiUrl(path = "") {
    const cleanedPath = String(path || "").replace(/^\/*/, "");
    const prefix = "/api";
    return `${API_BASE_URL}${prefix}/${cleanedPath}`;
}

window.buildApiUrl = buildApiUrl;
window.API_BASE_URL = API_BASE_URL;
