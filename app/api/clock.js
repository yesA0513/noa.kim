document.addEventListener('DOMContentLoaded', () => {
    // --- 설정 값 ---
    const HAND_COUNT = 300; // 잔상으로 사용할 초침의 총 개수
    const DELAY_STEP = 0.05; // 각 잔상 사이의 시간 간격 (초)

    // --- 초침 DIV를 동적으로 생성하는 함수 ---
    function createHands() {
        const container = document.querySelector('.second-hand-container');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < HAND_COUNT; i++) {
            const hand = document.createElement('div');
            hand.className = 'second-hand';
            const opacity = 1 - (i / HAND_COUNT);
            hand.style.opacity = opacity;
            container.appendChild(hand);
        }
    }

    // --- 디지털 시계(시, 분, 오전/오후)를 업데이트하는 함수 ---
    function updateDigitalTime() {
        const now = new Date();
        const seoulTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
        const hour = seoulTime.getHours();
        const minute = seoulTime.getMinutes();
        const period = hour >= 12 ? '오후' : '오전';
        const displayHour = hour % 12 || 12;
        document.getElementById('time-period').textContent = period;
        document.getElementById('time-hour').textContent = String(displayHour).padStart(2, '0');
        document.getElementById('time-minute').textContent = String(minute).padStart(2, '0');
    }

    // --- 아날로그 초침을 현재 시간과 동기화하는 함수 ---
    function syncAnalogHand() {
        const hands = document.querySelectorAll('.second-hand-container .second-hand');
        if (hands.length === 0) return;
        const now = new Date();
        const seoulTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
        const seconds = seoulTime.getSeconds() + (seoulTime.getMilliseconds() / 1000);
        const syncDelay = -seconds;
        hands.forEach((hand, index) => {
            const trailDelay = index * DELAY_STEP;
            const totalDelay = syncDelay + trailDelay;
            hand.style.animationDelay = `${totalDelay}s`;
        });
    }

    // --- 스크립트 실행 ---
    // .box9 요소가 실제로 존재하는지 확인 후 실행
    if (document.querySelector('.box9')) {
        createHands();
        syncAnalogHand();
        updateDigitalTime();
        setInterval(updateDigitalTime, 1000);
    }
});