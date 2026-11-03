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
        if (id !== section) { el.style.display = 'none'; return; }
        el.style.display = id === 'about-me' ? 'flex' : 'block';
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

// One dot per year of age on an exponential curve; the last dot fills in as the next birthday approaches.
function drawAgeDots(svg) {
    const now = new Date();
    let last = new Date(now.getFullYear(), 3, 12);
    if (now < last) last = new Date(now.getFullYear() - 1, 3, 12);
    const next = new Date(last.getFullYear() + 1, 3, 12);
    const age = last.getFullYear() - 2006;
    const frac = (now - last) / (next - last);

    // endpoints in viewBox units; k sets how sharply the curve bends upward
    const x0 = 8, y0 = 84, x1 = 332, y1 = 6, k = 3;
    const point = t => ({
        x: x0 + (x1 - x0) * t,
        y: y0 + (y1 - y0) * (Math.exp(k * t) - 1) / (Math.exp(k) - 1),
    });

    const ns = 'http://www.w3.org/2000/svg';
    const r = 2.5;
    const dot = (p, cls) => {
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('cx', p.x);
        c.setAttribute('cy', p.y);
        c.setAttribute('r', r);
        c.setAttribute('class', cls);
        svg.appendChild(c);
        return c;
    };

    for (let i = 0; i < age; i++) dot(point(i / age), 'age-dot');

    const end = point(1);
    const clip = document.createElementNS(ns, 'clipPath');
    clip.id = 'age-dot-clip';
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', end.x - r);
    rect.setAttribute('y', end.y - r);
    rect.setAttribute('width', 2 * r * frac);
    rect.setAttribute('height', 2 * r);
    clip.appendChild(rect);
    svg.appendChild(clip);
    dot(end, 'age-dot age-dot--partial').setAttribute('clip-path', 'url(#age-dot-clip)');
    dot(end, 'age-dot-outline');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.s-dots').forEach(drawAgeDots);
});

// Clicking the profile picture flips between the headshot and each alternative in turn
// (headshot, alt 1, headshot, alt 2, ...); the hidden face is swapped before each turn.
const PROFILE_DEFAULT = { src: 'media/IAPS - Jason Dixson Photography - 260608 - 105745 - 2018.jpg', alt: 'Rocio PV', pos: 'top center', bg: '#b8d4e9' };
const PROFILE_ALTS = [
    { src: 'media/pfp_waterfall.jpg', alt: 'Rocio by a waterfall', pos: 'center', bg: '#b8d4e9' },
    { src: 'media/drawing.png', alt: 'Pen drawing of Rocio', pos: 'center', bg: '#ffffff' },
    { src: 'media/me_square.jpg', alt: 'Rocio by the water', pos: 'center', bg: '#b8d4e9' },
    { src: 'media/pfp_lisbon.jpg', alt: 'Rocio at a castle wall in Lisbon', pos: 'center', bg: '#b8d4e9' },
    { src: 'media/pfp_talk.jpg', alt: 'Rocio giving a talk', pos: 'center', bg: '#b8d4e9' },
];

function profileFace(turns) {
    if (turns % 2 === 0) return PROFILE_DEFAULT;
    return PROFILE_ALTS[((turns - 1) / 2) % PROFILE_ALTS.length];
}

function setProfileFace(img, face) {
    img.src = face.src;
    img.alt = face.alt;
    img.style.objectPosition = face.pos;
    img.style.backgroundColor = face.bg;
}

function flipProfile(btn) {
    const turns = Number(btn.dataset.turns || 0) + 1;
    const faces = btn.querySelectorAll('.pfp-face');
    setProfileFace(faces[turns % 2], profileFace(turns));
    btn.dataset.turns = turns;
    btn.style.setProperty('--turns', turns);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.pfp-flip').forEach(btn => {
        const faces = btn.querySelectorAll('.pfp-face');
        setProfileFace(faces[0], profileFace(0));
        setProfileFace(faces[1], profileFace(1));
    });
});
