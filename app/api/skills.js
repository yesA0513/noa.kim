document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.skills-card');
    if (!card) return;

    const scroll = card.querySelector('.skills-scroll');
    const groups = card.querySelector('.skills-groups');
    const updateScrollHint = () => {
        card.classList.toggle('has-overflow', scroll.scrollHeight > scroll.clientHeight + 1);
        card.classList.toggle('is-at-end', scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 2);
    };

    scroll.addEventListener('scroll', updateScrollHint, { passive: true });
    const observer = new ResizeObserver(updateScrollHint);
    observer.observe(scroll);
    observer.observe(groups);
    document.fonts.ready.then(updateScrollHint);
    updateScrollHint();
});
