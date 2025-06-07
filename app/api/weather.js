const WEATHER_API_KEY = 'f5a6a7b99cf86fe4c826e302f1516864';
const SEONGNAM_LAT = 37.4386;
const SEONGNAM_LON = 127.1378;

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
        
        const tempElement = document.querySelector('.weather-temp');
        const descElement = document.querySelector('.weather-desc');
        const iconElement = document.querySelector('.weather-icon');
        const weatherBox = document.querySelector('.box8');
        
        if (tempElement) tempElement.textContent = `${temperature}°C`;
        if (descElement) descElement.textContent = description;
        if (iconElement) iconElement.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        
    } catch (error) {
        console.error('날씨 정보를 가져오는데 실패했습니다:', error);
        const tempElement = document.querySelector('.weather-temp');
        const descElement = document.querySelector('.weather-desc');
        const weatherBox = document.querySelector('.box8');
        
        if (tempElement) tempElement.textContent = '날씨 정보 없음';
        if (descElement) descElement.textContent = '잠시 후 다시 시도해주세요';
    }
}