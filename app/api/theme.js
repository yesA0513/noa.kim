(() => {
    const storageKey = 'noa-theme';
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const validTheme = value => value === 'light' || value === 'dark';
    let preference = null;

    try {
        const stored = localStorage.getItem(storageKey);
        if (validTheme(stored)) preference = stored;
    } catch {
        // 저장소를 사용할 수 없어도 현재 페이지의 모드 전환은 동작합니다.
    }

    const preferredTheme = () => preference || (systemTheme.matches ? 'dark' : 'light');

    const updateButton = theme => {
        const button = document.getElementById('theme-toggle');
        if (!button) return;
        const label = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
        button.setAttribute('aria-label', label);
        button.title = label;
    };

    const applyTheme = theme => {
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
        updateButton(theme);
    };

    // 스타일과 본문이 표시되기 전에 저장된 모드를 적용합니다.
    applyTheme(preferredTheme());

    systemTheme.addEventListener('change', () => {
        if (preference === null) applyTheme(preferredTheme());
    });

    window.addEventListener('storage', event => {
        if (event.key !== storageKey && event.key !== null) return;
        preference = validTheme(event.newValue) ? event.newValue : null;
        applyTheme(preferredTheme());
    });

    const initializeButton = () => {
        const button = document.getElementById('theme-toggle');
        if (!button) return;
        updateButton(root.dataset.theme);
        button.addEventListener('click', () => {
            preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
            applyTheme(preference);
            try {
                localStorage.setItem(storageKey, preference);
            } catch {
                // 브라우저가 저장을 막아도 선택한 모드는 현재 탭에 적용합니다.
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeButton, { once: true });
    } else {
        initializeButton();
    }
})();
