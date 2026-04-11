/**
 * Frontend API configuration.
 *
 * Use `window.TRUEDOC_API_BASE_URL` in a deployed frontend if your backend is hosted
 * at a separate domain from the frontend.
 */
const API_BASE_URL = "https://YOUR-BACKEND.onrender.com/api";

function buildApiUrl(path = "") {
    const cleanedPath = String(path || "").replace(/^\/*/, "");
    return `${API_BASE_URL}/${cleanedPath}`;
}

window.buildApiUrl = buildApiUrl;
window.API_BASE_URL = API_BASE_URL;
