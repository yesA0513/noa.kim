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
    tempElement.textContent = "—°C";
    descElement.textContent = "날씨를 불러오는 중";
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${SEONGNAM_LAT}&lon=${SEONGNAM_LON}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`, {
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
            ? current.description.trim() : "날씨 정보가 없어요";
        descElement.textContent = description;
        if (iconElement && /^\d{2}[dn]$/.test(current.icon)) {
            iconElement.onload = () => {
                iconElement.hidden = false;
                if (fallbackElement) fallbackElement.hidden = true;
            };
            iconElement.onerror = showFallbackIcon;
            iconElement.alt = `현재 날씨: ${description}`;
            iconElement.src = `https://openweathermap.org/img/wn/${current.icon}@2x.png`;
        }
    } catch {
        tempElement.textContent = "—°C";
        descElement.textContent = "날씨를 불러오지 못했어요";
        showFallbackIcon();
    } finally {
        window.clearTimeout(timeout);
    }
}
