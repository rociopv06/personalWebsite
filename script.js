document.addEventListener("DOMContentLoaded", function () {
    const dateEl = document.getElementById("receipt-date");
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
            + "  " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }

    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("mobile-menu");

    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    });

    document.addEventListener("click", (e) => {
        const header = document.getElementById("mobile-header");
        if (header && !header.contains(e.target) && !menu.contains(e.target)) {
            menu.style.display = "none";
        }
    });
});

function closeMenu() {
    const menu = document.getElementById("mobile-menu");
    if (menu) menu.style.display = "none";
}

function showSection(section) {
    const sections = ['portfolio', 'about-me', 'resume'];
    sections.forEach(id => {
        const el = document.getElementById(`${id}-content`);
        if (!el) return;
        if (id === section) {
            el.style.display = 'block';
            if (id === 'portfolio') el.classList.add('active-flex');
        } else {
            el.style.display = 'none';
            if (id === 'portfolio') el.classList.remove('active-flex');
        }
    });
    const macContent = document.querySelector('.mac-content');
    if (macContent) {
        macContent.classList.toggle('portfolio-active', section === 'portfolio');
        macContent.classList.toggle('scrollable', section === 'about-me' || section === 'resume');
    }
}

function openUp(el, webpage) {
    const clone = el.cloneNode(true);
    clone.classList.add("expanded");
    document.body.appendChild(clone);
    while (clone.firstChild) {
        clone.removeChild(clone.firstChild);
    }
    const rect = el.getBoundingClientRect();
    clone.style.position = 'fixed';
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.margin = 0;
    clone.style.transition = 'all 1s ease';

    requestAnimationFrame(() => {
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = '100vw';
        clone.style.height = '100vh';
        clone.style.zIndex = '9999';
    });
    setTimeout(() => {
        window.location.href = webpage;
    }, 800);
}
