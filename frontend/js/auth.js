const AUTH_STORAGE_KEY = "truedoc_auth";

function getStorage() {
    try {
        localStorage.setItem("__truedoc_test__", "1");
        localStorage.removeItem("__truedoc_test__");
        return localStorage;
    } catch {
        try {
            sessionStorage.setItem("__truedoc_test__", "1");
            sessionStorage.removeItem("__truedoc_test__");
            return sessionStorage;
        } catch {
            return null;
        }
    }
}

function readAuthState() {
    try {
        const storage = getStorage();
        if (!storage) {
            return null;
        }

        return JSON.parse(storage.getItem(AUTH_STORAGE_KEY) || "null");
    } catch {
        return null;
    }
}

function writeAuthState(state) {
    const storage = getStorage();
    if (!storage) {
        throw new Error("Browser storage is blocked. Open the frontend through a local server instead of directly from the file system.");
    }

    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function clearAuthState() {
    const storage = getStorage();
    if (!storage) {
        return;
    }

    storage.removeItem(AUTH_STORAGE_KEY);
}

function getToken() {
    return readAuthState()?.token || "";
}

function getCurrentUser() {
    return readAuthState()?.user || null;
}

function isSuperuser() {
    return getCurrentUser()?.role === "superuser";
}

function formatRoleLabel(role) {
    if (role === "superuser") {
        return "Admin";
    }

    if (role === "issuer") {
        return "Issuer";
    }

    return role || "User";
}

function authHeaders(extraHeaders = {}) {
    const token = getToken();
    return {
        ...extraHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

async function apiRequest(path, options = {}) {
    const response = await fetch(buildApiUrl(path), {
        ...options,
        headers: authHeaders(options.headers || {})
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message = typeof payload === "string"
            ? payload
            : payload.error || "Request failed";
        const error = new Error(message);
        if (payload && typeof payload === "object") {
            Object.assign(error, payload);
        }
        throw error;
    }

    return payload;
}

async function submitAuthForm(mode, payload) {
    const data = await apiRequest(`/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (data.token && data.user) {
        writeAuthState(data);
    }

    return data;
}

async function verifyEmailTokenRequest(token) {
    const data = await apiRequest("/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    });

    writeAuthState(data);
    return data;
}

async function resendVerificationRequest(email) {
    return apiRequest("/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
}

function updateAuthUI() {
    const user = getCurrentUser();
    const authCtas = document.querySelectorAll("[data-auth-cta]");
    const userBadges = document.querySelectorAll("[data-user-badge]");
    const superuserLinks = document.querySelectorAll("[data-superuser-link]");

    authCtas.forEach((element) => {
        if (!user) {
            element.innerHTML = `
                <span class="material-symbols-outlined text-[18px] mr-2">login</span>
                Login / Signup
            `;
            element.onclick = () => {
                window.location.href = "auth.html";
            };
            return;
        }

        element.innerHTML = `
            <span class="material-symbols-outlined text-[18px] mr-2">logout</span>
            Logout
        `;
        element.onclick = () => {
            clearAuthState();
            window.location.href = "index.html";
        };
    });

    userBadges.forEach((element) => {
        if (!user) {
            element.textContent = "Guest Access";
            return;
        }

        element.textContent = `${user.name} - ${formatRoleLabel(user.role)}`;
    });

    superuserLinks.forEach((element) => {
        element.classList.toggle("hidden", !isSuperuser());
    });
}

async function requireAuthenticatedUser(roles = []) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "auth.html";
        return null;
    }

    try {
        const data = await apiRequest("/auth/me");
        writeAuthState({
            token: getToken(),
            user: data.user
        });

        if (roles.length && !roles.includes(data.user.role)) {
            window.location.href = data.user.role === "superuser" ? "superuser.html" : "index.html";
            return null;
        }

        updateAuthUI();
        return data.user;
    } catch {
        clearAuthState();
        window.location.href = "auth.html";
        return null;
    }
}
