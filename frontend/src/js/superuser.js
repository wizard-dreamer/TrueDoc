async function loadSuperuserOverview() {
    const liveStatusLabel = document.getElementById("liveStatusLabel");
    const blockchainMetric = document.getElementById("blockchainMetric");
    const blockchainMetricNote = document.getElementById("blockchainMetricNote");
    const issuerMetric = document.getElementById("issuerMetric");
    const issuerMetricBar = document.getElementById("issuerMetricBar");
    const userCards = document.getElementById("issuerCards");
    const userCardsMobile = document.getElementById("issuerCardsMobile");
    const emptyState = document.getElementById("emptyUsers");

    try {
        const data = await apiRequest("/admin/overview");
        const isOnline = data.blockchain === "online";
        liveStatusLabel.textContent = isOnline ? "Live Network" : "Offline Network";
        blockchainMetric.textContent = isOnline ? "Live" : "Down";
        blockchainMetricNote.textContent = isOnline ? "Available" : "Check node";
        issuerMetric.textContent = String(data.registeredUsers.length);
        issuerMetricBar.style.width = data.registeredUsers.length ? "100%" : "16%";

        if (!data.registeredUsers.length) {
            emptyState.classList.remove("hidden");
            userCards.innerHTML = "";
            userCardsMobile.innerHTML = "";
            return;
        }

        const cardsMarkup = data.registeredUsers.map((user) => `
            <div class="group flex flex-col justify-between gap-6 rounded-2xl bg-white p-6 transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60 md:flex-row md:items-center">
                <div class="flex items-center gap-4">
                    <div class="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-900/30">
                        <span class="material-symbols-outlined">${user.role === "issuer" ? "account_balance" : "shield_person"}</span>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold">${user.name}</h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400">${user.email}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-6 md:flex md:items-center md:gap-8">
                    <div>
                        <span class="mb-1 block text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-slate-400">Role</span>
                        <span class="rounded-full bg-primary/10 px-3 py-1 text-[0.6875rem] font-bold uppercase text-primary">${user.role === "issuer" ? "Issuer" : "Admin"}</span>
                    </div>
                    <div>
                        <span class="mb-1 block text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-slate-400">Created</span>
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${new Date(user.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `).join("");

        const mobileMarkup = data.registeredUsers.map((user) => `
            <div class="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h4 class="text-lg font-bold">${user.name}</h4>
                        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${user.email}</p>
                    </div>
                    <span class="rounded-full bg-primary/10 px-3 py-1 text-[0.6875rem] font-bold uppercase text-primary">${user.role === "issuer" ? "Issuer" : "Admin"}</span>
                </div>
                <div class="mt-4">
                    <span class="mb-1 block text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-slate-400">Created</span>
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${new Date(user.createdAt).toLocaleString()}</span>
                </div>
            </div>
        `).join("");

        userCards.innerHTML = cardsMarkup;
        userCardsMobile.innerHTML = mobileMarkup;
    } catch (error) {
        liveStatusLabel.textContent = "Overview Error";
        blockchainMetric.textContent = "Error";
        blockchainMetricNote.textContent = error.message;
        issuerMetric.textContent = "0";
        issuerMetricBar.style.width = "0%";
    }
}
