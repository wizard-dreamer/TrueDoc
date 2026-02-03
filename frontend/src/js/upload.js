// ==============================
// TrueDoc - Upload & Register
// MetaMask-FREE Version
// ==============================
console.log("UPLOAD.JS LOADED");
let selectedFileHash = "";

/**
 * 1. Handle File Selection
 */
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show UI sections
    document.getElementById("filePreview").classList.remove("hidden");
    document.getElementById("hashSection").classList.remove("hidden");

    document.getElementById("fileName").innerText = file.name;
    document.getElementById("fileSize").innerText =
        (file.size / 1024).toFixed(2) + " KB";

    // Generate hash
    document.getElementById("hashValue").innerText = "Generating Fingerprint...";
    selectedFileHash = await calculateHash(file);
    document.getElementById("hashValue").innerText = selectedFileHash;

    // Enable register button
    const btn = document.getElementById("submitBtn");
    btn.disabled = false;
    btn.classList.remove("bg-slate-200", "text-slate-400");
    btn.classList.add("bg-primary", "text-white");
}

/**
 * 2. SHA-256 Hashing (Browser-side)
 */
async function calculateHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * 3. Register Document (Backend API)
 */
async function handleRegistration() {
    if (!selectedFileHash) return;

    const btn = document.getElementById("submitBtn");
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        const response = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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
        btn.disabled = false;
        btn.innerText = "Register on Blockchain";
    }
}

/**
 * 4. Reset UI
 */
function resetSelection() {
    document.getElementById("fileInput").value = "";
    document.getElementById("filePreview").classList.add("hidden");
    document.getElementById("hashSection").classList.add("hidden");

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.innerText = "Register on Blockchain";
    btn.classList.remove("bg-primary", "text-white");
    btn.classList.add("bg-slate-200", "text-slate-400");
}
