async function loadNavbar() {
    try {
        const response = await fetch('/components/navbar.html');
        const html = await response.text();
        document.getElementById('navbar-container').innerHTML = html;

        // Determine active nav based on current path
        const currentPage = window.location.pathname.split('/').pop();
        let activeNav = 'home';

        if (currentPage.includes('upload')) activeNav = 'upload';
        else if (currentPage.includes('verify')) activeNav = 'verify';
        else if (currentPage.includes('superuser')) activeNav = 'home';

        // Set active styles without changing layout size
        const activeLink = document.querySelector(`[data-nav="${activeNav}"]`);
        if (activeLink) {
            activeLink.classList.remove('text-slate-400', 'hover:text-blue-600', 'dark:text-slate-500', 'dark:hover:text-blue-300');
            activeLink.classList.add('bg-blue-50', 'text-blue-700', 'dark:bg-blue-900/30', 'dark:text-blue-300');
            activeLink.style.transitionDuration = '250ms';
        }

        // Update auth UI for role-based visibility
        updateAuthUI();
    } catch (error) {
        console.error('Failed to load navbar:', error);
    }
}