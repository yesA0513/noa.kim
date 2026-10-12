document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.second-hand-container');
    const display = document.querySelector('.time-display');
    const periodElement = document.getElementById('time-period');
    const hourElement = document.getElementById('time-hour');
    const minuteElement = document.getElementById('time-minute');
    if (!container || !display || !periodElement || !hourElement || !minuteElement) return;

    // Keep the seconds marker on the dial perimeter, clear of the digital time.
    const dial = document.createDocumentFragment();
    for (let index = 0; index < 12; index++) {
        const tick = document.createElement('span');
        tick.className = 'clock-tick';
        tick.style.setProperty('--tick-angle', `${index * 30}deg`);
        dial.appendChild(tick);
    }
    const hand = document.createElement('span');
    hand.className = 'second-hand';
    dial.appendChild(hand);
    container.replaceChildren(dial);
    container.setAttribute('aria-hidden', 'true');
    display.setAttribute('role', 'timer');
    display.setAttribute('aria-live', 'off');

    const seoulTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    });
    const updateDigitalTime = () => {
        const parts = seoulTime.formatToParts(new Date());
        const hour = parts.find(part => part.type === 'hour').value;
        const minute = parts.find(part => part.type === 'minute').value;
        periodElement.textContent = '서울';
        hourElement.textContent = hour;
        minuteElement.textContent = minute;
        display.setAttribute('aria-label', `서울 시간 ${hour}시 ${minute}분`);
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateSecondHand = () => {
        const now = new Date();
        const seconds = now.getSeconds() + (reducedMotion.matches ? 0 : now.getMilliseconds() / 1000);
        hand.style.transform = `rotate(${seconds * 6}deg)`;
    };
    let animationFrame;
    let tickInterval;
    const animate = () => {
        updateSecondHand();
        animationFrame = requestAnimationFrame(animate);
    };
    const startSeconds = () => {
        cancelAnimationFrame(animationFrame);
        clearInterval(tickInterval);
        updateSecondHand();
        if (document.hidden) return;
        if (reducedMotion.matches) tickInterval = setInterval(updateSecondHand, 1000);
        else animate();
    };

    updateDigitalTime();
    startSeconds();
    setInterval(updateDigitalTime, 1000);
    reducedMotion.addEventListener('change', startSeconds);
    document.addEventListener('visibilitychange', () => {
        updateDigitalTime();
        startSeconds();
    });
});
