document.addEventListener('DOMContentLoaded', () => {
    const studio = document.querySelector('#studio-site');
    const classic = document.querySelector('.contents');
    if (!studio || !classic) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const node = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
    };
    const text = selector => classic.querySelector(selector)?.textContent.trim() || '';
    const externalLink = (source, className) => {
        const link = node('a', className);
        link.href = source.href;
        link.target = source.target;
        link.rel = source.rel;
        return link;
    };

    // The two layouts read the same content. Studio deliberately has its own
    // markup, navigation and composition rather than restyling Classic cards.
    classic.querySelectorAll('.project-card').forEach((source, index) => {
        const link = externalLink(source, 's-work-item');
        const copy = node('div', 's-work-copy');
        copy.append(node('h3', 's-work-title', source.querySelector('h3').textContent));
        copy.append(node('p', 's-work-description', source.querySelector('.project-copy > p').textContent));
        copy.append(node('p', 's-work-tags', [...source.querySelectorAll('.project-tags span')].map(tag => tag.textContent).join(' / ')));
        const arrow = node('span', 's-work-arrow', '↗');
        arrow.setAttribute('aria-hidden', 'true');
        link.append(node('span', 's-work-index', String(index + 1).padStart(2, '0')), copy, arrow);
        studio.querySelector('.s-work-list').append(link);
    });
    classic.querySelectorAll('.small-project').forEach(source => {
        const link = externalLink(source, 's-more-item');
        const arrow = node('span', '', '↗');
        arrow.setAttribute('aria-hidden', 'true');
        link.append(node('span', '', source.querySelector('h3').textContent), arrow);
        studio.querySelector('.s-more-list').append(link);
    });
    studio.querySelector('.s-bio').textContent = text('.intro-copy');
    classic.querySelectorAll('.interest-list > div').forEach(source => {
        const item = node('div', 's-interest');
        item.append(node('h3', '', source.querySelector('h3').textContent), node('p', '', source.querySelector('p').textContent));
        studio.querySelector('.s-interest-list').append(item);
    });
    studio.querySelector('.s-toolbox').textContent = [...classic.querySelectorAll('.skill-name')].map(skill => skill.textContent).join(' / ');
    studio.querySelector('.s-learning').textContent = `배우는 중 · ${text('.learn > p:last-child')}`;
    classic.querySelectorAll('.education > div').forEach(source => {
        const item = node('div', 's-education-item');
        item.append(node('h4', '', source.querySelector('h3').textContent), node('p', '', source.querySelector('p').textContent));
        studio.querySelector('.s-education').append(item);
    });
    classic.querySelectorAll('.nav-links a').forEach(source => {
        if (source.href.startsWith('mailto:')) return;
        const link = externalLink(source, 's-social-link');
        link.textContent = source.dataset.tooltip || source.getAttribute('aria-label');
        studio.querySelector('.s-social').append(link);
    });
    const contact = classic.querySelector('.hero-actions a[href^="mailto:"]');
    if (contact) {
        studio.querySelectorAll('.s-contact, .s-email').forEach(link => { link.href = contact.href; });
        studio.querySelector('.s-email').textContent = contact.getAttribute('href').slice(7).split('?')[0];
    }
    const photo = studio.querySelector('.s-photo');
    const sourcePhoto = classic.querySelector('.showphoto img');
    photo.addEventListener('error', () => {
        photo.hidden = true;
        studio.querySelector('.s-photo-error').hidden = false;
    });
    photo.alt = sourcePhoto.alt;
    photo.src = sourcePhoto.getAttribute('src');
    studio.querySelector('.s-photo-album').href = classic.querySelector('.photo-details > .button-primary').href;
    studio.querySelector('.s-shots-link').href = classic.querySelector('.photo-other .text-link').href;
    studio.querySelector('.s-year').textContent = new Date().getFullYear();
    const syncService = () => {
        studio.querySelector('.s-service-status').textContent = [text('.service-status'), text('.service-countdown')].filter(Boolean).join(' · ');
    };
    const service = classic.querySelector('.service-card');
    if (service) new MutationObserver(syncService).observe(service, { childList: true, characterData: true, subtree: true });
    syncService();

    const syncTheme = () => {
        const dark = document.documentElement.dataset.theme === 'dark';
        const toggle = studio.querySelector('.s-theme-toggle');
        toggle.setAttribute('aria-label', dark ? '밝은 테마로 전환' : '어두운 테마로 전환');
        toggle.title = toggle.getAttribute('aria-label');
        studio.querySelectorAll('[data-studio-theme]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.studioTheme === document.documentElement.dataset.themePreference));
        });
    };
    studio.querySelector('.s-theme-toggle').addEventListener('click', () => {
        window.noaTheme.setPreference(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    studio.querySelectorAll('[data-studio-theme]').forEach(button => {
        button.addEventListener('click', () => window.noaTheme.setPreference(button.dataset.studioTheme));
    });
    window.addEventListener('themechange', syncTheme);
    syncTheme();

    const scrollToHash = ({ focus = false, smooth = false } = {}) => {
        if (document.documentElement.dataset.design !== 'studio') return;
        const target = document.getElementById(location.hash.slice(1) || 'studio-home');
        if (!target || !studio.contains(target)) return;
        target.scrollIntoView({ block: 'start', behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto' });
        if (focus) target.focus({ preventScroll: true });
    };
    studio.addEventListener('click', event => {
        const link = event.target.closest('[data-studio-nav]');
        if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (location.hash !== link.hash) history.pushState({ noaDesign: 'studio' }, '', link.hash);
        scrollToHash({ focus: true, smooth: true });
    });
    window.addEventListener('hashchange', () => scrollToHash({ focus: true }));
    window.addEventListener('designchange', () => {
        if (document.documentElement.dataset.design === 'studio') document.title = '김노아 · Studio';
        requestAnimationFrame(() => scrollToHash());
    });
    const sectionObserver = new IntersectionObserver(entries => {
        const visible = entries.find(entry => entry.isIntersecting);
        if (!visible || document.documentElement.dataset.design !== 'studio') return;
        studio.querySelectorAll('.s-nav a').forEach(link => {
            if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }, { root: studio, rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    studio.querySelectorAll('.s-hero, .s-section').forEach(section => sectionObserver.observe(section));
    if (document.documentElement.dataset.design === 'studio') document.title = '김노아 · Studio';
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash()));
});
