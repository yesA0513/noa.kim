document.addEventListener('DOMContentLoaded', () => {
    // MBTI 호버 기능
    const mbtiItems = document.querySelectorAll('.mbti-item');
    const mbtiDescriptions = document.querySelectorAll('.mbti-desc');
    const mbtiContainer = document.querySelector('.mbti-container');

    if (mbtiContainer) {
        mbtiItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const type = item.getAttribute('data-type');
                mbtiDescriptions.forEach(desc => {
                    desc.classList.remove('is-active');
                });
                const targetDesc = document.querySelector(`.mbti-desc[data-type="${type}"]`);
                if (targetDesc) {
                    targetDesc.classList.add('is-active');
                }
            });
        });

        mbtiContainer.addEventListener('mouseleave', () => {
            mbtiDescriptions.forEach(desc => {
                desc.classList.remove('is-active');
            });
        });
    }

    // 날씨 기능 초기화
    // getWeather 함수가 weather.js에 정의되어 있다고 가정합니다.
    if (typeof getWeather === 'function') {
        getWeather(); // 페이지 로드 시 날씨 정보 가져오기
        setInterval(getWeather, 1800000); // 30분마다 날씨 정보 업데이트
    }
});