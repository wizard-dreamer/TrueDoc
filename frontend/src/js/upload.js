// ==============================
// TrueDoc - Upload & Register
// MetaMask-FREE Version
// ==============================
console.log("UPLOAD.JS LOADED");
let selectedFileHash = "";

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value;
    }
}

function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.remove("hidden");
    }
}

function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add("hidden");
    }
}

function setButtonEnabled(id, enabled, label) {
    const button = document.getElementById(id);
    if (!button) {
        return;
    }

    button.disabled = !enabled;

    if (label) {
        button.innerText = label;
    }

    if (enabled) {
        button.classList.remove("bg-slate-200", "text-slate-400");
        button.classList.add("bg-primary", "text-white");
    } else {
        button.classList.remove("bg-primary", "text-white");
        button.classList.add("bg-slate-200", "text-slate-400");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const user = await requireAuthenticatedUser(["issuer", "superuser"]);
    if (!user) {
        return;
    }

    updateAuthUI();
    const status = document.getElementById("walletStatus");
    if (status) {
        status.textContent = `${user.name} - ${user.role === "superuser" ? "Admin" : "Issuer"}`;
        status.classList.remove("hidden");
    }

    const userOrb = document.getElementById("userOrb");
    if (userOrb) {
        userOrb.textContent = (user.name || "U").trim().charAt(0);
        userOrb.classList.remove("hidden");
        userOrb.classList.add("flex");
    }
});

/**
 * 1. Handle File Selection
 */
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileSize = `${(file.size / 1024).toFixed(2)} KB`;

    showElement("filePreview");
    showElement("hashSection");
    showElement("filePreviewMobile");
    showElement("hashSectionMobile");

    setText("fileName", file.name);
    setText("fileNameMobile", file.name);
    setText("fileSize", `Size: ${fileSize}`);
    setText("fileSizeMobile", `Size: ${fileSize}`);

    setText("hashValue", "Generating Fingerprint...");
    setText("hashValueMobile", "Generating Fingerprint...");
    selectedFileHash = await calculateHash(file);
    setText("hashValue", selectedFileHash);
    setText("hashValueMobile", selectedFileHash);

    setButtonEnabled("submitBtn", true, "Register Document");
    setButtonEnabled("submitBtnMobile", true, "Register Document");
}

/**
 * 2. SHA-256 Hashing (Browser-side)
 */
async function calculateHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * 3. Register Document (Backend API)
 */
async function handleRegistration() {
    if (!selectedFileHash) return;

    setButtonEnabled("submitBtn", false, "Processing...");
    setButtonEnabled("submitBtnMobile", false, "Processing...");

    try {
        const response = await fetch(buildApiUrl("/register"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify({
                hash: selectedFileHash
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Registration failed");
        }

        alert("Document registered successfully!");
        resetSelection();
    } catch (error) {
        console.error(error);
        alert("Registration failed: " + error.message);
        setButtonEnabled("submitBtn", true, "Register Document");
        setButtonEnabled("submitBtnMobile", true, "Register Document");
    }
}

/**
 * 4. Reset UI
 */
function resetSelection() {
    selectedFileHash = "";

    const desktopInput = document.getElementById("fileInput");
    const mobileInput = document.getElementById("fileInputMobile");
    if (desktopInput) {
        desktopInput.value = "";
    }
    if (mobileInput) {
        mobileInput.value = "";
    }

    hideElement("filePreview");
    hideElement("hashSection");
    hideElement("filePreviewMobile");
    hideElement("hashSectionMobile");

    setButtonEnabled("submitBtn", false, "Register Document");
    setButtonEnabled("submitBtnMobile", false, "Register Document");
}
