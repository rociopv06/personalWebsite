function showSection(section) {
    const sections = ['portfolio', 'interests', 'about-me', 'resume'];
    sections.forEach(id => {
        const element = document.getElementById(`${id}-content`); // <-- backticks
        if (element) {
            element.style.display = (id === section) ? 'block' : 'none';
        }
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

