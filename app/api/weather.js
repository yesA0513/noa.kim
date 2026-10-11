const WEATHER_API_KEY = 'f5a6a7b99cf86fe4c826e302f1516864';
const SEONGNAM_LAT = 37.4386;
const SEONGNAM_LON = 127.1378;

async function getWeather() {
    const tempElement = document.querySelector(".weather-temp");
    const descElement = document.querySelector(".weather-desc");
    const iconElement = document.querySelector(".weather-icon");
    const fallbackElement = document.querySelector(".weather-fallback");
    if (!tempElement || !descElement) return;

    const showFallbackIcon = () => {
        if (iconElement) {
            iconElement.hidden = true;
            iconElement.removeAttribute("src");
        }
        if (fallbackElement) fallbackElement.hidden = false;
    };
    showFallbackIcon();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${SEONGNAM_LAT}&lon=${SEONGNAM_LON}&appid=${WEATHER_API_KEY}&units=metric&lang=en`, {
            signal: controller.signal,
        });
        if (!response.ok) throw new Error("Weather request failed");
        const data = await response.json();
        const current = data?.weather?.[0];
        if (!Number.isFinite(data?.main?.temp) || !current) {
            throw new Error("Weather data unavailable");
        }

        tempElement.textContent = `${Math.round(data.main.temp)}°C`;
        const description = typeof current.description === "string" && current.description.trim()
            ? current.description.trim() : "Cloudy";
        descElement.textContent = description.charAt(0).toUpperCase() + description.slice(1);
        if (iconElement && /^\d{2}[dn]$/.test(current.icon)) {
            iconElement.onload = () => {
                iconElement.hidden = false;
                if (fallbackElement) fallbackElement.hidden = true;
            };
            iconElement.onerror = showFallbackIcon;
            iconElement.alt = description;
            iconElement.src = `https://openweathermap.org/img/wn/${current.icon}@2x.png`;
        }
    } catch {
        tempElement.textContent = "—°C";
        descElement.textContent = "Unavailable";
        showFallbackIcon();
    } finally {
        window.clearTimeout(timeout);
    }
}
