function showResult(isSuccess, title, details) {
    const card = document.getElementById('resultCard');
    const icon = document.getElementById('resultIcon');
    const titleEl = document.getElementById('resultTitle');
    const detailsEl = document.getElementById('resultDetails');

    card.classList.remove('hidden');
    titleEl.innerText = title;
    detailsEl.innerText = details;

    if (isSuccess) {
        card.className = "p-5 rounded-2xl border-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-4";
        icon.className = "size-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center";
        icon.innerHTML = `<span class="material-symbols-outlined">check_circle</span>`;
    } else {
        card.className = "p-5 rounded-2xl border-2 bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-4";
        icon.className = "size-12 rounded-xl bg-red-500 text-white flex items-center justify-center";
        icon.innerHTML = `<span class="material-symbols-outlined">warning</span>`;
    }
}

async function handleFileVerify(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        showResult(true, "Verifying document...", "Generating SHA-256 fingerprint");

        const fileHash = await calculateHash(file);
        const response = await fetch(`http://127.0.0.1:3000/api/verify/${encodeURIComponent(fileHash)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Verification failed");
        }

        if (data.exists) {
            const issuedAt = Number(data.timestamp) > 0 ? new Date(Number(data.timestamp) * 1000).toLocaleString() : "Unknown date";
            showResult(true, "Document Verified", `Issued by ${shortAddress(data.issuer)} on ${issuedAt}`);
        } else {
            showResult(false, "Document Not Found", "No matching fingerprint on the blockchain");
        }
    } catch (error) {
        console.error(error);
        showResult(false, "Verification failed", error.reason || error.message || "Unable to verify document");
    }
}

function shortAddress(address) {
    if (!address || address.length < 10) return address || "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

async function calculateHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
