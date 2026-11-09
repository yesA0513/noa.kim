(() => {
    const root = document.documentElement;
    const storageKey = 'noa-design';
    const designs = ['classic', 'studio'];
    const defaultDesign = 'studio';
    const normalize = value => designs.includes(value) ? value : null;
    let design = defaultDesign;

    try { design = normalize(localStorage.getItem(storageKey)) || design; }
    catch { /* Design switching also works without browser storage. */ }
    design = normalize(new URL(location.href).searchParams.get('design')) || design;

    const syncControls = () => {
        const viewport = document.querySelector('#main-content');
        const dock = document.querySelector('.media-dock');
        const focused = document.activeElement;
        if (viewport && dock) {
            // Match keyboard order to the navigation's visual position. Moving
            // the open settings panel must preserve the selected button's focus.
            if (design === 'studio' && dock.nextElementSibling !== viewport) viewport.before(dock);
            if (design === 'classic' && viewport.nextElementSibling !== dock) viewport.after(dock);
            if (focused && dock.contains(focused) && document.activeElement !== focused) focused.focus({ preventScroll: true });
        }
        document.querySelectorAll('[data-design-choice]').forEach(button => {
            const selected = button.dataset.designChoice === design;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        const triggerLabel = document.querySelector('.settings-trigger-label');
        const title = document.querySelector('#ambient-title');
        if (triggerLabel) triggerLabel.textContent = design === 'studio' ? 'Settings' : 'Ambient';
        if (title) title.textContent = design === 'studio' ? 'Display Settings' : 'Ambient Styles';
    };
    const apply = () => {
        root.dataset.design = design;
        const url = new URL(location.href);
        if (url.searchParams.has('design') && url.searchParams.get('design') !== design) {
            url.searchParams.set('design', design);
            history.replaceState(null, '', url);
        }
        syncControls();
        window.dispatchEvent(new CustomEvent('designchange', { detail: { design } }));
    };

    window.noaDesign = Object.freeze({
        setPreference(value) {
            if (!normalize(value)) return;
            design = value;
            try { localStorage.setItem(storageKey, design); }
            catch { /* Keep the choice active for the current page. */ }
            apply();
        },
    });

    document.addEventListener('DOMContentLoaded', () => {
        syncControls();
        document.querySelectorAll('[data-design-choice]').forEach(button => {
            button.addEventListener('click', () => window.noaDesign.setPreference(button.dataset.designChoice));
        });
    });
    window.addEventListener('storage', event => {
        if (event.key !== storageKey && event.key !== null) return;
        design = normalize(event.newValue) || defaultDesign;
        apply();
    });

    // Set the design before the styles load to avoid flashing the other layout.
    apply();
})();
