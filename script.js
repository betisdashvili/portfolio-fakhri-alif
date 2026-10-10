document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const themeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {
        root.setAttribute("data-bs-theme", theme);
        try { localStorage.setItem("theme", theme); } catch (e) { /* ignored */ }

        if (!themeToggle) return;
        const icon = themeToggle.querySelector("i");
        const isDark = theme === "dark";
        icon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
        themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }

    applyTheme(root.getAttribute("data-bs-theme") || "light");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            applyTheme(root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
        });
    }

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

    const typedRole = document.getElementById("typedRole");
    if (typedRole) {
        const roles = (typedRole.dataset.roles || "")
            .split("|")
            .map((r) => r.trim())
            .filter(Boolean);

        if (roles.length > 1) {
            if (reduceMotion) {
                let i = 0;
                setInterval(() => {
                    i = (i + 1) % roles.length;
                    typedRole.textContent = roles[i];
                }, 2500);
            } else {
                let roleIndex = 0;
                let charIndex = 0;
                let deleting = false;
                typedRole.textContent = "";

                const type = () => {
                    const word = roles[roleIndex];
                    let delay;

                    if (!deleting) {
                        charIndex++;
                        delay = 90;
                        if (charIndex === word.length) { deleting = true; delay = 1800; }
                    } else {
                        charIndex--;
                        delay = 45;
                        if (charIndex === 0) {
                            deleting = false;
                            roleIndex = (roleIndex + 1) % roles.length;
                            delay = 400;
                        }
                    }
                    typedRole.textContent = word.slice(0, charIndex);
                    setTimeout(type, delay);
                };
                type();
            }
        }
    }

    const heroSlides = document.getElementById("heroSlides");
    if (heroSlides && !reduceMotion) {
        const FADE_MS = 700;

        const checkLoaded = (img) => new Promise((resolve) => {
            if (img.complete) return resolve(img.naturalWidth > 0 ? img : null);
            img.addEventListener("load", () => resolve(img), { once: true });
            img.addEventListener("error", () => resolve(null), { once: true });
        });

        Promise.all([...heroSlides.querySelectorAll(".hero-slide")].map(checkLoaded)).then((results) => {
            const slides = results.filter(Boolean);
            if (!slides.length) return;

            heroSlides.classList.add("has-slides");

            if (slides.length === 1) {
                slides[0].classList.add("active");
                return;
            }

            let current = 0;
            const showNext = () => {
                const slide = slides[current];
                const duration = Number(slide.dataset.duration) || 4000;

                slide.classList.add("active");
                setTimeout(() => {
                    slide.classList.remove("active");
                    current = (current + 1) % slides.length;
                    setTimeout(showNext, FADE_MS + 150);
                }, duration);
            };
            showNext();
        });
    }
});