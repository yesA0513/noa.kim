document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const consoleElement = document.querySelector('.ambient-console');
    const trigger = document.querySelector('.ambient-trigger');
    const closeButton = document.querySelector('.ambient-close');
    const powerButton = document.querySelector('.ambient-power');
    const panel = document.querySelector('.ambient-panel');
    const modeButtons = document.querySelectorAll('.ambient-mode');
    const themeButtons = document.querySelectorAll('.ambient-theme');
    const themeStatuses = document.querySelectorAll('.theme-status');
    const presets = document.querySelectorAll('.ambient-preset');
    const picker = document.querySelector('.ambient-picker input');
    const multiPrimary = document.querySelector('.ambient-multi-primary');
    const multiSecondary = document.querySelector('.ambient-multi-secondary');
    const brightness = document.querySelector('.ambient-brightness');
    const brightnessValue = document.querySelector('.ambient-brightness-value');
    const multiColors = ['#56d7ff', '#a778ff', '#ff7daf'];

    const savedSettings = () => {
        try {
            const value = JSON.parse(localStorage.getItem('ambient-light') || '{}');
            return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        }
        catch { return {}; }
    };
    const save = (value) => {
        try { localStorage.setItem('ambient-light', JSON.stringify(value)); }
        catch { /* Controls remain usable when browser storage is unavailable. */ }
    };
    const setThemeButtons = () => {
        themeButtons.forEach((button) => {
            const isActive = button.dataset.themePreference === root.dataset.themePreference;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
        themeStatuses.forEach(status => { status.textContent = root.dataset.theme === 'dark' ? 'DARK' : 'LIGHT'; });
    };
    setThemeButtons();
    window.addEventListener('themechange', setThemeButtons);
    themeButtons.forEach((button) => button.addEventListener('click', () => {
        window.noaTheme.setPreference(button.dataset.themePreference);
    }));
    const setModeButtons = (mode) => modeButtons.forEach((button) => {
        const isActive = button.dataset.ambientMode === mode;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    const setBrightness = (value, shouldSave = true) => {
        const intensity = Math.max(20, Math.min(100, Number(value)));
        root.style.setProperty('--ambient-intensity', root.dataset.ambientEnabled === 'false' ? 0 : intensity / 100);
        brightness.value = intensity;
        brightnessValue.textContent = `${intensity}%`;
        if (shouldSave) {
            const current = savedSettings();
            save({ ...current, brightness: intensity });
        }
    };

    const setPower = (isEnabled, shouldSave = true) => {
        root.dataset.ambientEnabled = String(isEnabled);
        powerButton.classList.toggle('is-active', isEnabled);
        powerButton.setAttribute('aria-pressed', String(isEnabled));
        powerButton.textContent = isEnabled ? 'ON' : 'OFF';
        powerButton.setAttribute('aria-label', `Turn ambient lighting ${isEnabled ? 'off' : 'on'}`);
        root.style.setProperty('--ambient-intensity', isEnabled ? Number(brightness.value) / 100 : 0);
        if (shouldSave) save({ ...savedSettings(), enabled: isEnabled });
    };

    const setColor = (color, shouldSave = true) => {
        root.style.setProperty('--ambient-primary', color);
        root.style.setProperty('--ambient-secondary', color);
        root.style.setProperty('--ambient-tertiary', color);
        root.dataset.ambientMode = 'single';
        setModeButtons('single');
        picker.value = color;
        presets.forEach((preset) => preset.classList.toggle('is-active', preset.dataset.ambientColor === color));
        const brightnessSetting = Number(brightness.value);
        if (shouldSave) save({ ...savedSettings(), mode: 'single', color, brightness: brightnessSetting });
    };

    const setMulti = (colors = multiColors, presetColor = '', shouldSave = true) => {
        const [primary, secondary, tertiary = colors[1]] = colors;
        root.style.setProperty('--ambient-primary', primary);
        root.style.setProperty('--ambient-secondary', secondary);
        root.style.setProperty('--ambient-tertiary', tertiary);
        root.dataset.ambientMode = 'multi';
        setModeButtons('multi');
        multiPrimary.value = primary;
        multiSecondary.value = secondary;
        presets.forEach((preset) => preset.classList.toggle('is-active', preset.dataset.ambientColor === presetColor));
        if (shouldSave) save({ ...savedSettings(), mode: 'multi', colors: [primary, secondary, tertiary], presetColor, brightness: Number(brightness.value) });
    };

    try {
        const saved = savedSettings();
        if (saved.mode === 'single' && saved.color) setColor(saved.color, false);
        else setMulti(saved.colors || multiColors, saved.presetColor || '', false);
        setBrightness(saved?.brightness ?? 85, false);
        setPower(saved?.enabled ?? true, false);
    } catch {
        setMulti(multiColors, '', false);
        setBrightness(85, false);
        setPower(true, false);
    }

    const setPanelOpen = (isOpen, restoreFocus = false) => {
        consoleElement.classList.toggle('is-open', isOpen);
        trigger.setAttribute('aria-expanded', String(isOpen));
        panel.setAttribute('aria-hidden', String(!isOpen));
        panel.inert = !isOpen;
        if (isOpen) {
            requestAnimationFrame(() => {
                if (!consoleElement.classList.contains('is-open')) return;
                panel.querySelector('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')?.focus();
            });
        } else if (restoreFocus) trigger.focus();
    };
    setPanelOpen(false);
    trigger.addEventListener('click', () => {
        setPanelOpen(!consoleElement.classList.contains('is-open'));
    });
    closeButton.addEventListener('click', () => setPanelOpen(false, true));
    document.addEventListener('click', event => {
        if (!consoleElement.contains(event.target)) setPanelOpen(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !consoleElement.classList.contains('is-open')) return;
        event.preventDefault();
        setPanelOpen(false, true);
    });
    powerButton.addEventListener('click', () => setPower(root.dataset.ambientEnabled !== 'true'));
    modeButtons.forEach((button) => button.addEventListener('click', () => {
        if (button.dataset.ambientMode === 'multi') setMulti();
        else setColor(picker.value);
    }));
    presets.forEach((preset) => preset.addEventListener('click', () => {
        if (root.dataset.ambientMode === 'multi') {
            setMulti(preset.dataset.ambientMulti.split(','), preset.dataset.ambientColor);
        } else {
            setColor(preset.dataset.ambientColor);
        }
    }));
    picker.addEventListener('input', (event) => setColor(event.target.value));
    multiPrimary.addEventListener('input', () => setMulti([multiPrimary.value, multiSecondary.value, multiSecondary.value]));
    multiSecondary.addEventListener('input', () => setMulti([multiPrimary.value, multiSecondary.value, multiSecondary.value]));
    brightness.addEventListener('input', (event) => setBrightness(event.target.value));
});
