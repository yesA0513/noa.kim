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
    const colorPattern = /^#[0-9a-f]{6}$/i;
    const normalizeColor = value => colorPattern.test(value || '') ? value.toLowerCase() : null;
    const normalizeColors = value => Array.isArray(value) && value.length >= 2 && value.every(normalizeColor)
        ? value.slice(0, 3).map(normalizeColor) : multiColors;
    let disabledOutside = [];
    let returnFocus = trigger;

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
        themeStatuses.forEach(status => { status.textContent = root.dataset.theme === 'dark' ? '다크' : '라이트'; });
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
    const setPresetButtons = (color = '', colors = []) => {
        presets.forEach((preset) => {
            const presetColors = preset.dataset.ambientMulti.split(',').map(normalizeColor);
            const isActive = Boolean(color && normalizeColor(preset.dataset.ambientColor) === normalizeColor(color))
                || (!color && colors.length > 0 && presetColors.join(',') === colors.join(','));
            preset.classList.toggle('is-active', isActive);
            preset.setAttribute('aria-pressed', String(isActive));
        });
        picker.closest('.ambient-picker').classList.toggle('is-active', ![...presets].some(preset => preset.classList.contains('is-active')));
    };

    const setBrightness = (value, shouldSave = true) => {
        const number = Number(value);
        const intensity = Number.isFinite(number) ? Math.max(20, Math.min(100, number)) : 85;
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
        powerButton.textContent = isEnabled ? '켜짐' : '꺼짐';
        powerButton.setAttribute('aria-label', `앰비언트 조명 ${isEnabled ? '끄기' : '켜기'}`);
        root.style.setProperty('--ambient-intensity', isEnabled ? Number(brightness.value) / 100 : 0);
        if (shouldSave) save({ ...savedSettings(), enabled: isEnabled });
    };

    const setColor = (color, shouldSave = true) => {
        color = normalizeColor(color) || multiColors[0];
        root.style.setProperty('--ambient-primary', color);
        root.style.setProperty('--ambient-secondary', color);
        root.style.setProperty('--ambient-tertiary', color);
        root.dataset.ambientMode = 'single';
        setModeButtons('single');
        picker.value = color;
        setPresetButtons(color);
        const brightnessSetting = Number(brightness.value);
        if (shouldSave) save({ ...savedSettings(), mode: 'single', color, brightness: brightnessSetting });
    };

    const setMulti = (colors = multiColors, presetColor = '', shouldSave = true) => {
        colors = normalizeColors(colors);
        const [primary, secondary, tertiary = colors[1]] = colors;
        root.style.setProperty('--ambient-primary', primary);
        root.style.setProperty('--ambient-secondary', secondary);
        root.style.setProperty('--ambient-tertiary', tertiary);
        root.dataset.ambientMode = 'multi';
        setModeButtons('multi');
        multiPrimary.value = primary;
        multiSecondary.value = secondary;
        setPresetButtons(presetColor, [primary, secondary, tertiary]);
        if (shouldSave) save({ ...savedSettings(), mode: 'multi', colors: [primary, secondary, tertiary], presetColor, brightness: Number(brightness.value) });
    };

    try {
        const saved = savedSettings();
        if (saved.mode === 'single' && saved.color) setColor(saved.color, false);
        else setMulti(saved.colors || multiColors, saved.presetColor || '', false);
        setBrightness(saved?.brightness ?? 85, false);
        setPower(saved?.enabled !== false, false);
    } catch {
        setMulti(multiColors, '', false);
        setBrightness(85, false);
        setPower(true, false);
    }

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
        } else if (!isOpen && wasOpen) enableBackground();
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
