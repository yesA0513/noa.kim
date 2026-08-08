document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const consoleElement = document.querySelector('.ambient-console');
    const trigger = document.querySelector('.ambient-trigger');
    const closeButton = document.querySelector('.ambient-close');
    const panel = document.querySelector('.ambient-panel');
    const modeButtons = document.querySelectorAll('.ambient-mode');
    const presets = document.querySelectorAll('.ambient-preset');
    const picker = document.querySelector('.ambient-picker input');
    const brightness = document.querySelector('.ambient-brightness');
    const brightnessValue = document.querySelector('.ambient-brightness-value');
    const multiColors = ['#56d7ff', '#a778ff', '#ff7daf'];

    const save = (value) => localStorage.setItem('ambient-light', JSON.stringify(value));
    const setModeButtons = (mode) => modeButtons.forEach((button) => {
        const isActive = button.dataset.ambientMode === mode;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    const setBrightness = (value, shouldSave = true) => {
        const intensity = Math.max(20, Math.min(100, Number(value)));
        root.style.setProperty('--ambient-intensity', intensity / 100);
        brightness.value = intensity;
        brightnessValue.textContent = `${intensity}%`;
        if (shouldSave) {
            const current = JSON.parse(localStorage.getItem('ambient-light') || '{}');
            save({ ...current, brightness: intensity });
        }
    };

    const setColor = (color) => {
        root.style.setProperty('--ambient-primary', color);
        root.style.setProperty('--ambient-secondary', color);
        root.style.setProperty('--ambient-tertiary', color);
        root.dataset.ambientMode = 'single';
        setModeButtons('single');
        picker.value = color;
        presets.forEach((preset) => preset.classList.toggle('is-active', preset.dataset.ambientColor === color));
        const brightnessSetting = Number(brightness.value);
        save({ mode: 'single', color, brightness: brightnessSetting });
    };

    const setMulti = (colors = multiColors, presetColor = '') => {
        root.style.setProperty('--ambient-primary', colors[0]);
        root.style.setProperty('--ambient-secondary', colors[1]);
        root.style.setProperty('--ambient-tertiary', colors[2]);
        root.dataset.ambientMode = 'multi';
        setModeButtons('multi');
        presets.forEach((preset) => preset.classList.toggle('is-active', preset.dataset.ambientColor === presetColor));
        save({ mode: 'multi', colors, presetColor, brightness: Number(brightness.value) });
    };

    try {
        const saved = JSON.parse(localStorage.getItem('ambient-light'));
        if (saved?.mode === 'single' && saved.color) setColor(saved.color);
        else setMulti(saved?.colors || multiColors, saved?.presetColor || '');
        setBrightness(saved?.brightness ?? 85, false);
    } catch {
        setMulti();
    }

    trigger.addEventListener('click', () => {
        const isOpen = consoleElement.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
        panel.setAttribute('aria-hidden', String(!isOpen));
    });
    closeButton.addEventListener('click', () => trigger.click());
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
    brightness.addEventListener('input', (event) => setBrightness(event.target.value));
});
