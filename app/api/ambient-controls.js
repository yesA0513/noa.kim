document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const consoleElement = document.querySelector('.ambient-console');
    const trigger = document.querySelector('.ambient-trigger');
    const closeButton = document.querySelector('.ambient-close');
    const powerButton = document.querySelector('.ambient-power');
    const panel = document.querySelector('.ambient-panel');
    const themeButtons = document.querySelectorAll('.ambient-theme');
    const themeStatuses = document.querySelectorAll('.theme-status');
    const playbackButtons = document.querySelectorAll('.ambient-playback');
    const playbackStatus = document.querySelector('.ambient-dynamic-status');
    const triggerLabel = document.querySelector('.settings-trigger-label');
    const worlds = document.querySelectorAll('.scene-world');
    const accentButtons = document.querySelectorAll('.ambient-accent');
    const accentStatus = document.querySelector('.ambient-accent-status');
    const brightness = document.querySelector('.ambient-brightness');
    const brightnessValue = document.querySelector('.ambient-brightness-value');
    const defaultScene = 'moonlit-voyage';
    const defaultAccent = '#91a9bc';
    // Old scene-only/preset selections still retain their color palette. The
    // manual artwork is now always the one base scene; Dynamic uses all worlds.
    const legacyPalettes = [
        { scene: 'moonlit-voyage', color: '#56d7ff', colors: ['#56d7ff', '#a778ff', '#ff7daf'] },
        { scene: 'cosmic-drift', color: '#ae7aff', colors: ['#7174ff', '#ae7aff', '#ff82c8'] },
        { scene: 'afterglow', color: '#ff78b8', colors: ['#ff6e9f', '#a778ff', '#56d7ff'] },
        { scene: 'desert-dusk', color: '#ffb454', colors: ['#ffb454', '#ff766d', '#a778ff'] },
        { scene: 'aurora', color: '#55e6b0', colors: ['#55e6b0', '#56d7ff', '#a778ff'] },
        { scene: 'forest-whisper', color: '#c7f36b', colors: ['#c7f36b', '#55e6b0', '#56d7ff'] },
        { scene: 'deep-current', color: '#4f8cff', colors: ['#4f8cff', '#56d7ff', '#55e6b0'] },
        { scene: 'midnight-drive', color: '#ff6172', colors: ['#ff6172', '#ffb454', '#a778ff'] },
    ];
    const colorPattern = /^#[0-9a-f]{6}$/i;
    const normalizeColor = value => typeof value === 'string' && colorPattern.test(value) ? value.toLowerCase() : null;
    const validColors = value => Array.isArray(value) && value.length >= 2 && value.every(normalizeColor);
    let disabledOutside = [];
    let returnFocus = trigger;

    const savedSettings = () => {
        try {
            const value = JSON.parse(localStorage.getItem('ambient-light') || '{}');
            return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        }
        catch { return {}; }
    };
    let currentSettings = savedSettings();
    let playback = currentSettings.playback === 'dynamic' ? 'dynamic' : 'manual';
    let dynamicTimer;
    const save = value => {
        // Dynamic's rendered scene never replaces the saved manual colors.
        currentSettings = { ...value, scene: defaultScene, playback };
        try { localStorage.setItem('ambient-light', JSON.stringify(currentSettings)); }
        catch { /* Controls remain usable when browser storage is unavailable. */ }
    };
    const setThemeButtons = () => {
        themeButtons.forEach(button => {
            const active = button.dataset.themePreference === root.dataset.themePreference;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        themeStatuses.forEach(status => { status.textContent = root.dataset.theme === 'dark' ? 'Dark' : 'Light'; });
    };
    setThemeButtons();
    window.addEventListener('themechange', setThemeButtons);
    themeButtons.forEach(button => button.addEventListener('click', () => {
        window.noaTheme.setPreference(button.dataset.themePreference);
    }));
    const syncAccents = () => {
        const selectedColor = currentSettings.mode === 'single' ? normalizeColor(currentSettings.color) : null;
        let matched = false;
        accentButtons.forEach(button => {
            const selected = selectedColor === button.dataset.ambientAccent;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-pressed', String(selected));
            if (selected) matched = true;
        });
        accentStatus.hidden = matched;
    };

    const setBrightness = (value, shouldSave = true) => {
        const number = Number(value);
        const intensity = Number.isFinite(number) ? Math.max(20, Math.min(100, number)) : 85;
        root.style.setProperty('--ambient-intensity', root.dataset.ambientEnabled === 'false' ? 0 : intensity / 100);
        brightness.value = intensity;
        brightnessValue.textContent = `${intensity}%`;
        currentSettings = { ...currentSettings, brightness: intensity };
        if (shouldSave) save(currentSettings);
    };
    const setPower = (isEnabled, shouldSave = true) => {
        root.dataset.ambientEnabled = String(isEnabled);
        powerButton.classList.toggle('is-active', isEnabled);
        powerButton.setAttribute('aria-pressed', String(isEnabled));
        powerButton.textContent = isEnabled ? 'ON' : 'OFF';
        powerButton.setAttribute('aria-label', `Turn ambient lighting ${isEnabled ? 'off' : 'on'}`);
        root.style.setProperty('--ambient-intensity', isEnabled ? Number(brightness.value) / 100 : 0);
        currentSettings = { ...currentSettings, enabled: isEnabled };
        if (shouldSave) save(currentSettings);
    };
    const setColor = (color, shouldSave = true) => {
        const savedColor = normalizeColor(color) ? color : defaultAccent;
        const renderedColor = normalizeColor(savedColor);
        root.dataset.ambientScene = defaultScene;
        root.dataset.ambientMode = 'single';
        root.style.setProperty('--ambient-primary', renderedColor);
        root.style.setProperty('--ambient-secondary', renderedColor);
        root.style.setProperty('--ambient-tertiary', renderedColor);
        currentSettings = { ...currentSettings, mode: 'single', color: savedColor, scene: defaultScene };
        syncAccents();
        if (shouldSave) save(currentSettings);
    };
    const setMulti = (colors, presetColor = '', shouldSave = true) => {
        // Preserve older multi-color preferences without exposing another mode
        // selector. Choosing a color preset explicitly replaces them.
        const savedColors = validColors(colors) ? [...colors] : [defaultAccent, defaultAccent, defaultAccent];
        const [primary, secondary, tertiary = secondary] = savedColors.map(normalizeColor);
        root.dataset.ambientScene = defaultScene;
        root.dataset.ambientMode = 'multi';
        root.style.setProperty('--ambient-primary', primary);
        root.style.setProperty('--ambient-secondary', secondary);
        root.style.setProperty('--ambient-tertiary', tertiary);
        currentSettings = { ...currentSettings, mode: 'multi', colors: savedColors, presetColor, scene: defaultScene };
        syncAccents();
        if (shouldSave) save(currentSettings);
    };
    try {
        const saved = currentSettings;
        const legacy = legacyPalettes.find(palette => palette.scene === saved.scene || palette.color === normalizeColor(saved.presetColor));
        if (saved.mode === 'single') setColor(normalizeColor(saved.color) ? saved.color : legacy?.color, false);
        else if (validColors(saved.colors)) setMulti(saved.colors, saved.presetColor || '', false);
        else if (legacy) setMulti(legacy.colors, saved.presetColor || legacy.color, false);
        else if (saved.mode === 'multi') setMulti(undefined, saved.presetColor || '', false);
        else setColor(saved.color || saved.presetColor, false);
        setBrightness(saved.brightness ?? 85, false);
        setPower(saved.enabled !== false, false);
    } catch {
        setColor(defaultAccent, false);
        setBrightness(85, false);
        setPower(true, false);
    }

    const refreshDynamic = () => {
        clearTimeout(dynamicTimer);
        if (playback !== 'dynamic' || document.hidden || root.dataset.design === 'studio') return;
        const snapshot = window.noaAmbientTime.getSnapshot();
        const [primary, secondary, tertiary] = snapshot.colors;
        root.style.setProperty('--ambient-primary', primary);
        root.style.setProperty('--ambient-secondary', secondary);
        root.style.setProperty('--ambient-tertiary', tertiary);
        root.style.setProperty('--ambient-daylight', snapshot.daylight);
        root.dataset.ambientScene = snapshot.scene;
        root.dataset.ambientPeriod = snapshot.period;
        root.dataset.ambientMode = 'multi';
        worlds.forEach(world => {
            let opacity = 0;
            if (world.dataset.scene === snapshot.scene) opacity += 1 - snapshot.blend;
            if (world.dataset.scene === snapshot.nextScene) opacity += snapshot.blend;
            world.style.opacity = String(opacity);
        });
        playbackStatus.textContent = `서울 ${snapshot.time} · ${snapshot.period}`;
        // Recompute from the clock, rather than accumulating timer drift.
        dynamicTimer = setTimeout(refreshDynamic, 60000 - Date.now() % 60000 + 50);
    };
    const setPlayback = (value, shouldSave = true) => {
        const selected = value === 'dynamic' ? 'dynamic' : 'manual';
        if (selected === playback && root.dataset.ambientPlayback === selected) return;
        playback = selected;
        currentSettings = { ...currentSettings, playback };
        root.dataset.ambientPlayback = playback;
        playbackButtons.forEach(button => {
            const active = button.dataset.ambientPlayback === playback;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        triggerLabel.textContent = playback === 'dynamic' ? 'Dynamic' : 'Ambient';
        if (playback === 'manual') {
            clearTimeout(dynamicTimer);
            worlds.forEach(world => world.style.removeProperty('opacity'));
            root.style.removeProperty('--ambient-daylight');
            delete root.dataset.ambientPeriod;
            const manual = currentSettings;
            root.dataset.ambientScene = defaultScene;
            if (manual.mode === 'single') setColor(manual.color, false);
            else setMulti(manual.colors, manual.presetColor, false);
            playbackStatus.textContent = '색상 프리셋을 선택합니다.';
        } else {
            playbackStatus.textContent = '서울 시간에 맞춰 색과 배경이 변합니다.';
            refreshDynamic();
        }
        if (shouldSave) save(currentSettings);
    };
    setPlayback(playback, false);
    playbackButtons.forEach(button => button.addEventListener('click', () => setPlayback(button.dataset.ambientPlayback)));
    document.addEventListener('visibilitychange', refreshDynamic);
    window.addEventListener('focus', refreshDynamic);
    window.addEventListener('pageshow', refreshDynamic);
    window.addEventListener('designchange', refreshDynamic);

    const focusableControls = () => [...panel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]')]
        .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
    const disableBackground = () => {
        let branch = panel;
        while (branch.parentElement && branch !== document.body) {
            [...branch.parentElement.children].forEach(sibling => {
                if (sibling === branch || ['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)) return;
                disabledOutside.push({ element: sibling, inert: sibling.inert });
                sibling.inert = true;
            });
            branch = branch.parentElement;
        }
    };
    const enableBackground = () => {
        disabledOutside.forEach(({ element, inert }) => { element.inert = inert; });
        disabledOutside = [];
    };
    const setPanelOpen = (isOpen, restoreFocus = false) => {
        const wasOpen = consoleElement.classList.contains('is-open');
        if (isOpen && !wasOpen) {
            returnFocus = trigger;
            disableBackground();
        } else if (!isOpen && wasOpen) {
            enableBackground();
        }
        consoleElement.classList.toggle('is-open', isOpen);
        document.body.classList.toggle('ambient-settings-open', isOpen);
        trigger.setAttribute('aria-expanded', String(isOpen));
        panel.setAttribute('aria-hidden', String(!isOpen));
        panel.inert = !isOpen;
        if (isOpen) {
            // Wait for the visibility transition to begin before moving focus into the screen.
            requestAnimationFrame(() => requestAnimationFrame(() => {
                if (!consoleElement.classList.contains('is-open')) return;
                (closeButton || focusableControls()[0])?.focus({ preventScroll: true });
            }));
        } else if (restoreFocus && wasOpen) {
            (returnFocus?.isConnected ? returnFocus : trigger).focus({ preventScroll: true });
        }
    };
    setPanelOpen(false);
    trigger.addEventListener('click', () => {
        setPanelOpen(!consoleElement.classList.contains('is-open'));
    });
    closeButton.addEventListener('click', () => setPanelOpen(false, true));
    document.addEventListener('click', event => {
        if (consoleElement.classList.contains('is-open') && !panel.contains(event.target) && !trigger.contains(event.target)) {
            setPanelOpen(false, true);
        }
    });
    document.addEventListener('keydown', event => {
        if (!consoleElement.classList.contains('is-open')) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            setPanelOpen(false, true);
        } else if (event.key === 'Tab') {
            const controls = focusableControls();
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (!first) return;
            if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        }
    });
    powerButton.addEventListener('click', () => {
        setPower(root.dataset.ambientEnabled !== 'true');
        refreshDynamic();
    });
    accentButtons.forEach(button => button.addEventListener('click', () => {
        const color = button.dataset.ambientAccent;
        setPlayback('manual');
        setColor(color);
    }));
    brightness.addEventListener('input', event => setBrightness(event.target.value));
});
