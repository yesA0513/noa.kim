(() => {
    const root = document.documentElement;
    const storageKey = 'noa-design';
    const designs = ['classic', 'studio'];
    const defaultDesign = 'studio';
    const normalize = value => designs.includes(value) ? value : null;
    const hashes = {
        studio: { '#overview': '#studio-home', '#work': '#studio-work', '#more-work': '#studio-work', '#photography': '#studio-photography', '#main-content': '#studio-main' },
        classic: { '#studio-home': '#overview', '#studio-main': '#overview', '#studio-work': '#work', '#studio-photography': '#photography', '#studio-about': '#overview' },
    };
    let design = defaultDesign;
    try { design = normalize(localStorage.getItem(storageKey)) || design; }
    catch { /* Switching also works without browser storage. */ }
    design = normalize(new URL(location.href).searchParams.get('design')) || design;

    const syncViews = () => {
        const classic = document.querySelector('.contents');
        const studio = document.querySelector('#studio-site');
        if (classic && studio) {
            classic.hidden = design === 'studio';
            classic.inert = design === 'studio';
            studio.hidden = design !== 'studio';
            studio.inert = design !== 'studio';
        }
        document.querySelectorAll('[data-design-choice]').forEach(button => {
            const selected = button.dataset.designChoice === design;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
    };
    const apply = ({ focus = false } = {}) => {
        const previous = root.dataset.design;
        const previousView = document.querySelector(previous === 'studio' ? '#studio-site' : '.contents');
        const restoreFocus = focus || previousView?.contains(document.activeElement);
        if (design === 'studio' && document.querySelector('.ambient-console.is-open')) {
            // Release the modal's background inert states before showing Studio.
            document.querySelector('.ambient-close')?.click();
        }
        root.dataset.design = design;
        const url = new URL(location.href);
        if (url.searchParams.has('design')) url.searchParams.set('design', design);
        const mappedHash = hashes[design][url.hash];
        if (mappedHash) url.hash = mappedHash;
        if (url.href !== location.href || history.state?.noaDesign !== design) {
            history.replaceState({ ...history.state, noaDesign: design }, '', url);
        }
        syncViews();
        window.dispatchEvent(new CustomEvent('designchange', { detail: { design } }));
        if (restoreFocus && previous !== design) {
            const control = document.querySelector(design === 'studio' ? '.s-classic' : '.ambient-trigger');
            control?.focus({ preventScroll: true });
        }
    };
    window.noaDesign = Object.freeze({
        setPreference(value) {
            if (!normalize(value)) return;
            design = value;
            try { localStorage.setItem(storageKey, design); }
            catch { /* Keep the choice active for the current page. */ }
            apply({ focus: true });
        },
    });
    document.addEventListener('DOMContentLoaded', () => {
        syncViews();
        document.querySelectorAll('[data-design-choice]').forEach(button => {
            button.addEventListener('click', () => window.noaDesign.setPreference(button.dataset.designChoice));
        });
    });
    window.addEventListener('storage', event => {
        if (event.key !== storageKey && event.key !== null) return;
        design = normalize(event.newValue) || defaultDesign;
        apply();
    });
    window.addEventListener('popstate', event => {
        const fromUrl = normalize(new URL(location.href).searchParams.get('design'));
        const restored = fromUrl || normalize(event.state?.noaDesign);
        if (restored && restored !== design) {
            design = restored;
            apply({ focus: true });
        }
    });
    apply();
})();
