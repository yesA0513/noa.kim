const WEATHER_API_KEY = 'f5a6a7b99cf86fe4c826e302f1516864';
const SEONGNAM_LAT = 37.4386;
const SEONGNAM_LON = 127.1378;

// 날씨 상태에 따른 그라데이션 매핑
const weatherGradients = {
    light: {
        'Clear': 'linear-gradient(180deg, #87CEEB, #E0F6FF)',
        'Clouds': 'linear-gradient(180deg, #A9A9A9, #D3D3D3)',
        'Rain': 'linear-gradient(180deg, #4682B4, #778899)',
        'Snow': 'linear-gradient(180deg, #F0F8FF, #FFFFFF)',
        'Mist': 'linear-gradient(180deg, #B8B8B8, #D8D8D8)',
        'Fog': 'linear-gradient(180deg, #B8B8B8, #D8D8D8)',
        'Thunderstorm': 'linear-gradient(180deg, #483D8B, #4B0082)',
        'Drizzle': 'linear-gradient(180deg, #87CEEB, #B0C4DE)',
        'default': 'linear-gradient(180deg, #fff3c8, #f1f1f1)'
    },
    dark: {
        'Clear': 'linear-gradient(180deg, #1a2833, #222222)',
        'Clouds': 'linear-gradient(180deg, #393939, #222222)',
        'Rain': 'linear-gradient(180deg, #1a2429, #222222)',
        'Snow': 'linear-gradient(180deg, #292e33, #222222)',
        'Mist': 'linear-gradient(180deg, #292929, #222222)',
        'Fog': 'linear-gradient(180deg, #292929, #222222)',
        'Thunderstorm': 'linear-gradient(180deg, #1a1a2e, #222222)',
        'Drizzle': 'linear-gradient(180deg, #1a2429, #222222)',
        'default': 'linear-gradient(180deg, #1a2833, #222222)'
    }
};

async function getWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${SEONGNAM_LAT}&lon=${SEONGNAM_LON}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`);
        
        if (!response.ok) {
            throw new Error('날씨 API 응답 오류');
        }
        
        const data = await response.json();
        
        if (!data || !data.main || !data.weather || !data.weather[0]) {
            throw new Error('날씨 데이터 형식 오류');
        }
        
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;
        const weatherMain = data.weather[0].main;
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const tempElement = document.querySelector('.weather-temp');
        const descElement = document.querySelector('.weather-desc');
        const iconElement = document.querySelector('.weather-icon');
        const weatherBox = document.querySelector('.box8');
        
        if (tempElement) tempElement.textContent = `${temperature}°C`;
        if (descElement) descElement.textContent = description;
        if (iconElement) iconElement.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        
        // 다크모드에 따른 그라데이션 적용
        const gradients = isDarkMode ? weatherGradients.dark : weatherGradients.light;
        if (weatherBox) {
            weatherBox.style.background = gradients[weatherMain] || gradients.default;
        }
    } catch (error) {
        console.error('날씨 정보를 가져오는데 실패했습니다:', error);
        const tempElement = document.querySelector('.weather-temp');
        const descElement = document.querySelector('.weather-desc');
        const weatherBox = document.querySelector('.box8');
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (tempElement) tempElement.textContent = '날씨 정보 없음';
        if (descElement) descElement.textContent = '잠시 후 다시 시도해주세요';
        if (weatherBox) {
            weatherBox.style.background = isDarkMode ? 
                weatherGradients.dark.default : 
                weatherGradients.light.default;
        }
    }
}

// 다크모드 변경 감지
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', getWeather); 