const READING_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnl6040yESVY2M0wQbhzj7spTyaRZtbGXCo27lWmHuNdJ2E97lfTs-bMfcsn0Xkd9ACD5_uhgYtq2w/pub?output=csv';

function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i + 1] === '"') { field += '"'; i++; }
                else inQuotes = false;
            } else field += c;
        } else if (c === '"') inQuotes = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(field); field = '';
            if (row.some(v => v !== '')) rows.push(row);
            row = [];
        } else field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
}

function titleFromUrl(url) {
    try {
        const { hostname, pathname } = new URL(url);
        const slug = pathname.split('/').filter(Boolean).pop() || hostname;
        return slug
            .replace(/\.(html?|php|aspx?)$/i, '')
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    } catch {
        return url;
    }
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

document.addEventListener('DOMContentLoaded', function () {
    const latestEl = document.getElementById('latest-read');
    const list = document.getElementById('archive-list');
    if (latestEl && list) {
        fetch(READING_SHEET_CSV_URL)
            .then(res => res.text())
            .then(csv => {
                const [header, ...rows] = parseCsv(csv);
                const cols = header.map(h => h.trim().toLowerCase());
                const dateIdx = cols.indexOf('date');
                const urlIdx = cols.indexOf('url');
                const titleIdx = cols.indexOf('title');
                const entries = rows.map(r => {
                    const url = r[urlIdx].trim();
                    const title = (r[titleIdx] || '').trim() || titleFromUrl(url);
                    const html = `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>`;
                    const dateStr = r[dateIdx].trim();
                    const [mm, dd, yyyy] = dateStr.split('/').map(Number);
                    return { date: dateStr, html, sortKey: new Date(yyyy, mm - 1, dd).getTime() };
                });
                entries.sort((a, b) => b.sortKey - a.sortKey);
                if (!entries.length) return;
                const [latest, ...rest] = entries;
                latestEl.innerHTML = `Latest highlighted read: ${latest.date} - ${latest.html} &nbsp;  <button class="archive-toggle" id="archive-toggle-btn">Archive ⏷</button>`;
                list.innerHTML = rest.map(e => `<li>${e.date} - ${e.html}</li>`).join('');
                document.getElementById('archive-toggle-btn').addEventListener('click', function () {
                    const opening = list.style.display !== 'block';
                    list.style.display = opening ? 'block' : 'none';
                    if (opening) {
                        requestAnimationFrame(() => { list.scrollTop = list.scrollHeight; });
                    }
                });
            })
            .catch(err => console.error('Failed to load reading sheet', err));
    }
});

function switchTab(group, id, btn) {
    document.querySelectorAll('#' + group + '-' + id).forEach(() => {});
    const allPanels = document.querySelectorAll('[id^="' + group + '-"]');
    allPanels.forEach(p => p.classList.add('tab-panel--hidden'));
    document.getElementById(group + '-' + id).classList.remove('tab-panel--hidden');

    const tabsBar = btn.closest('.tabs-bar');
    tabsBar.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
    btn.classList.add('tab--active');
}

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
        el.style.display = id === section ? 'block' : 'none';
    });
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
