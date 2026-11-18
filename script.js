document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const scrollProgressBar = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');
    const timeline = document.getElementById('timeline');
    const timelineEntries = Array.from(document.querySelectorAll('.timeline-entry'));
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const noResults = document.getElementById('noResults');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    // Counter elements
    const countAll = document.getElementById('countAll');
    const countWinner = document.getElementById('countWinner');
    const countLeadership = document.getElementById('countLeadership');
    const countOpenSource = document.getElementById('countOpenSource');
    const countHackathon = document.getElementById('countHackathon');
    const statWins = document.getElementById('statWins');

    // State
    let activeFilter = 'all';
    let searchQuery = '';

    // Set Copyright Year
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ---------------------------------------------------------
    // 1. THEME MANAGEMENT (Persistent with LocalStorage)
    // ---------------------------------------------------------
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
        });
    }

    // ---------------------------------------------------------
    // 2. SCROLL PROGRESS & BACK TO TOP
    // ---------------------------------------------------------
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        if (scrollProgressBar) {
            scrollProgressBar.style.width = `${scrolled}%`;
        }

        if (backToTopBtn) {
            if (scrollTop > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ---------------------------------------------------------
    // 3. CATEGORY COUNTS INITIALIZATION
    // ---------------------------------------------------------
    function updateCategoryCounts() {
        let totalAll = timelineEntries.length;
        let totalWinner = 0;
        let totalLeadership = 0;
        let totalOpenSource = 0;
        let totalHackathon = 0;

        timelineEntries.forEach(entry => {
            const cat = entry.getAttribute('data-category') || '';
            if (cat.includes('winner')) totalWinner++;
            if (cat.includes('leadership')) totalLeadership++;
            if (cat.includes('opensource')) totalOpenSource++;
            if (cat.includes('hackathon')) totalHackathon++;
        });

        if (countAll) countAll.textContent = totalAll;
        if (countWinner) countWinner.textContent = totalWinner;
        if (countLeadership) countLeadership.textContent = totalLeadership;
        if (countOpenSource) countOpenSource.textContent = totalOpenSource;
        if (countHackathon) countHackathon.textContent = totalHackathon;
        if (statWins) statWins.textContent = `${totalAll}+`;
    }

    updateCategoryCounts();

    // ---------------------------------------------------------
    // 4. INTERSECTION OBSERVER FOR CARDS & TIMELINE ANIMATION
    // ---------------------------------------------------------
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    timelineEntries.forEach(entry => {
        cardObserver.observe(entry);
    });

    // Timeline Line Animation trigger
    setTimeout(() => {
        if (timeline) {
            timeline.classList.add('animated');
        }
    }, 300);

    // ---------------------------------------------------------
    // 5. SEARCH & FILTER LOGIC
    // ---------------------------------------------------------
    function filterEntries() {
        let visibleCount = 0;
        const query = searchQuery.trim().toLowerCase();

        timelineEntries.forEach(entry => {
            const category = (entry.getAttribute('data-category') || '').toLowerCase();
            const textContent = entry.innerText.toLowerCase();

            const matchesCategory = (activeFilter === 'all') || category.includes(activeFilter);
            const matchesSearch = !query || textContent.includes(query);

            if (matchesCategory && matchesSearch) {
                entry.style.display = '';
                // re-check visibility
                setTimeout(() => entry.classList.add('visible'), 50);
                visibleCount++;
            } else {
                entry.style.display = 'none';
                entry.classList.remove('visible');
            }
        });

        // Toggle No Results message
        if (noResults) {
            if (visibleCount === 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
            }
        }
    }

    // Filter Buttons click handler
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter') || 'all';
            filterEntries();
        });
    });

    // Search Input handling
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (clearSearchBtn) {
                if (searchQuery.length > 0) {
                    clearSearchBtn.classList.add('active');
                } else {
                    clearSearchBtn.classList.remove('active');
                }
            }
            filterEntries();
        });
    }

    // Clear Search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.classList.remove('active');
            filterEntries();
            searchInput.focus();
        });
    }

    // Reset filters button
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            activeFilter = 'all';
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.classList.remove('active');

            filterButtons.forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
            });

            filterEntries();
        });
    }
});
