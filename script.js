document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const themeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {
        root.setAttribute("data-bs-theme", theme);
        try { localStorage.setItem("theme", theme); } catch (e) { /* ignored */ }

        const icon = themeToggle.querySelector("i");
        const isDark = theme === "dark";
        icon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
        themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }

    applyTheme(root.getAttribute("data-bs-theme") || "light");
    themeToggle.addEventListener("click", () => {
        applyTheme(root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
    });

    const nav = document.getElementById("mainNav");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const navMenu = document.getElementById("navMenu");
    document.querySelectorAll("#navMenu .nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            if (navMenu.classList.contains("show")) {
                bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
            }
        });
    });

    const counters = document.querySelectorAll(".counter");

    function animateCounter(el) {
        const target = Number(el.dataset.count);
        if (reduceMotion || !target) { el.textContent = target; return; }

        const duration = 1200;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if ("IntersectionObserver" in window) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        counters.forEach((el) => {
            if (!reduceMotion) el.textContent = "0";
            counterObserver.observe(el);
        });
    }

    document.querySelectorAll(".project-img").forEach((img) => {
        img.addEventListener("error", () => {
            const placeholder = document.createElement("div");
            placeholder.className = "project-img-placeholder";
            placeholder.setAttribute("role", "img");
            placeholder.setAttribute("aria-label", img.alt);
            placeholder.innerHTML = '<i class="bi bi-image" aria-hidden="true"></i>';
            img.replaceWith(placeholder);
        }, { once: true });
    });

    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
});