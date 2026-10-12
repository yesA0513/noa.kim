document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.querySelector('#main-content');
    const pages = [...document.querySelectorAll('.app-page[data-page]')];
    const navigation = [...document.querySelectorAll('.section-nav a')];
    const pageNames = { overview: 'Overview', work: 'Projects', photography: 'Photography' };
    const resolvePage = (hash = location.hash) => hash === '#photography' ? 'photography'
        : ['#work', '#more-work'].includes(hash) ? 'work' : 'overview';
    const showPage = ({ focus = false } = {}) => {
        const name = resolvePage();
        const selected = pages.find(page => page.dataset.page === name);
        if (!selected || !viewport) return;

        const focusWillBeHidden = pages.some(page => page !== selected && page.contains(document.activeElement));
        pages.forEach(page => {
            const isHidden = page !== selected;
            page.hidden = isHidden;
            page.inert = isHidden;
        });
        navigation.forEach(link => {
            const isActive = link.hash === `#${name}`;
            link.classList.toggle('is-active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
        document.body.dataset.page = name;
        document.title = `${pageNames[name]} | 김노아 @yesA0513`;
        viewport.scrollTop = 0;
        if (focus || focusWillBeHidden) {
            const title = selected.querySelector('.page-title');
            (title || viewport).focus({ preventScroll: true });
        }
    };
    if (viewport && pages.length) {
        viewport.setAttribute('tabindex', '-1');
        showPage();
        window.addEventListener('hashchange', () => showPage({ focus: true }));
        document.addEventListener('click', event => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const link = event.target.closest('a[href]');
            if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
            const target = new URL(link.href, location.href);
            if (target.origin !== location.origin || target.pathname !== location.pathname || target.search !== location.search) return;

            if (target.hash === '#main-content') {
                event.preventDefault();
                viewport.scrollTop = 0;
                viewport.focus({ preventScroll: true });
                return;
            }
            if (!['#overview', '#work', '#more-work', '#photography'].includes(target.hash)) return;
            event.preventDefault();
            if (target.hash !== location.hash) history.pushState(null, '', target.hash);
            showPage({ focus: true });
        });
    }

    const photo = document.querySelector('.showphoto img');
    const photoFallback = document.querySelector('.photo-fallback');
    if (photo && photoFallback) {
        const showPhotoFallback = () => {
            photo.hidden = true;
            photoFallback.hidden = false;
        };
        photo.addEventListener('error', showPhotoFallback);
        if (photo.complete && photo.naturalWidth === 0) showPhotoFallback();
    }

    const mbtiItems = [...document.querySelectorAll('.mbti-item')];
    const mbtiDescriptions = [...document.querySelectorAll('.mbti-desc')];
    const descriptionPanel = document.querySelector('.mbti-descriptions');

    const setMbti = (selected = null) => {
        mbtiItems.forEach(item => {
            const isActive = item === selected;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
            item.setAttribute('aria-expanded', String(isActive));
        });
        mbtiDescriptions.forEach(description => {
            const isActive = selected?.dataset.type === description.dataset.type;
            description.classList.toggle('is-active', isActive);
            description.hidden = !isActive;
            description.setAttribute('aria-hidden', String(!isActive));
        });
        if (descriptionPanel) {
            descriptionPanel.classList.toggle('is-open', Boolean(selected));
            descriptionPanel.setAttribute('aria-hidden', String(!selected));
        }
    };

    mbtiItems.forEach(item => {
        const description = mbtiDescriptions.find(element => element.dataset.type === item.dataset.type);
        if (description) {
            description.id ||= `mbti-description-${item.dataset.type.toLowerCase()}`;
            item.setAttribute('aria-controls', description.id);
        }
        item.addEventListener('click', () => setMbti(item.classList.contains('is-active') ? null : item));
    });
    setMbti();

    document.addEventListener('click', event => {
        if (mbtiItems.some(item => item.contains(event.target)) || descriptionPanel?.contains(event.target)) return;
        setMbti();
    });
    document.addEventListener('keydown', event => {
        const activeItem = mbtiItems.find(item => item.classList.contains('is-active'));
        if (event.key !== 'Escape' || !activeItem) return;
        event.preventDefault();
        setMbti();
        activeItem.focus();
    });
});
