(() => {
    const root = document.documentElement;
    const storageKey = 'noa-theme';
    const preferences = ['system', 'light', 'dark'];
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    let preference = 'system';

    try {
        const saved = localStorage.getItem(storageKey);
        if (preferences.includes(saved)) preference = saved;
    } catch {
        // The system theme still works when browser storage is unavailable.
    }

    const apply = () => {
        root.dataset.themePreference = preference;
        root.dataset.theme = preference === 'system'
            ? (systemTheme.matches ? 'dark' : 'light')
            : preference;
        window.dispatchEvent(new Event('themechange'));
    };

    window.noaTheme = Object.freeze({
        setPreference(value) {
            if (!preferences.includes(value)) return;
            preference = value;
            try { localStorage.setItem(storageKey, value); }
            catch { /* Keep the selected theme active for this page. */ }
            apply();
        },
    });

    const followSystemTheme = () => {
        if (preference === 'system') apply();
    };
    if (systemTheme.addEventListener) systemTheme.addEventListener('change', followSystemTheme);
    else systemTheme.addListener(followSystemTheme);

    window.addEventListener('storage', (event) => {
        if (event.key !== storageKey && event.key !== null) return;
        preference = preferences.includes(event.newValue) ? event.newValue : 'system';
        apply();
    });

    // This file loads synchronously in the head, before the page styles.
    apply();
})();
