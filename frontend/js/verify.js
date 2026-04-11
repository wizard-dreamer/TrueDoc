function nowStamp() {
    return new Date().toLocaleString();
}

function setAuditLog(entries, statusLabel = "Live Connection Active") {
    const auditLog = document.getElementById("auditLog");
    const auditStatus = document.getElementById("auditStatus");

    if (auditStatus) {
        auditStatus.textContent = statusLabel;
    }

    if (!auditLog) {
        return;
    }

    auditLog.innerHTML = entries.map((entry, index) => `
        <div class="flex justify-between rounded-md ${index % 2 === 0 ? "bg-slate-100/60 dark:bg-slate-900" : "bg-white dark:bg-slate-950"} p-4">
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400">${entry.time}</span>
            <span class="font-mono text-xs ${entry.tone}">${entry.label}</span>
            <span class="font-mono text-xs font-bold text-slate-900 dark:text-white">${entry.value}</span>
        </div>
    `).join("");
}

function showResult(isSuccess, title, details, reference = "RESULT") {
    const referenceEl = document.getElementById("resultReference");
    const iconWrap = document.getElementById("resultIconWrap");
    const icon = document.getElementById("resultHeroIcon");
    const titleEl = document.getElementById("resultTitle");
    const detailsEl = document.getElementById("resultDetails");

    referenceEl.innerText = reference;
    titleEl.innerText = title;
    detailsEl.innerText = details;

    if (isSuccess) {
        iconWrap.className = "mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 mx-auto";
        icon.className = "material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-6xl";
        icon.style.fontVariationSettings = "'FILL' 1";
        icon.innerText = "verified_user";
    } else {
        iconWrap.className = "mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 mx-auto";
        icon.className = "material-symbols-outlined text-red-600 dark:text-red-400 text-6xl";
        icon.style.fontVariationSettings = "'FILL' 1";
        icon.innerText = "gpp_maybe";
    }
}

async function handleFileVerify(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        showResult(true, "Verifying document...", "Generating SHA-256 fingerprint", "Reference: LIVE_CHECK");
        setAuditLog([
            { time: nowStamp(), label: "BUFFERING_FILE", value: file.name, tone: "text-slate-500 dark:text-slate-400" },
            { time: nowStamp(), label: "HASH_PROCESSING", value: "SHA-256", tone: "text-primary" }
        ], "Processing");

        const fileHash = await calculateHash(file);
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/verify/${encodeURIComponent(fileHash)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Verification failed");
        }

        if (data.exists) {
            const issuedAt = Number(data.timestamp) > 0 ? new Date(Number(data.timestamp) * 1000).toLocaleString() : "Unknown date";
            showResult(true, "Verification Successful", `The document integrity has been validated. Issued by ${shortAddress(data.issuer)} on ${issuedAt}.`, `Hash: ${fileHash.slice(0, 8)}...`);
            setAuditLog([
                { time: nowStamp(), label: "NODE_QUERY_SUCCESS", value: `SHA-256: ${fileHash.slice(0, 10)}...`, tone: "text-emerald-600 dark:text-emerald-400" },
                { time: nowStamp(), label: "ISSUER_MATCH", value: shortAddress(data.issuer), tone: "text-primary" },
                { time: nowStamp(), label: "BLOCKCHAIN_TIMESTAMP", value: issuedAt, tone: "text-slate-500 dark:text-slate-400" }
            ]);
        } else {
            showResult(false, "Verification Failed", "The file fingerprint does not match any stored blockchain record.", `Hash: ${fileHash.slice(0, 8)}...`);
            setAuditLog([
                { time: nowStamp(), label: "NODE_QUERY_SUCCESS", value: `SHA-256: ${fileHash.slice(0, 10)}...`, tone: "text-primary" },
                { time: nowStamp(), label: "NO_MATCH_FOUND", value: "CHAIN_LOOKUP_EMPTY", tone: "text-red-600 dark:text-red-400" },
                { time: nowStamp(), label: "VERIFICATION_STATUS", value: "DOCUMENT_NOT_FOUND", tone: "text-slate-500 dark:text-slate-400" }
            ], "Mismatch Detected");
        }
    } catch (error) {
        console.error(error);
        const message = error.reason || error.message || "Unable to verify document";
        showResult(false, "Verification Failed", message, "Reference: ERROR");
        setAuditLog([
            { time: nowStamp(), label: "REQUEST_ERROR", value: message, tone: "text-red-600 dark:text-red-400" },
            { time: nowStamp(), label: "VERIFICATION_STATUS", value: "REQUEST_ABORTED", tone: "text-slate-500 dark:text-slate-400" }
        ], "Connection Issue");
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
