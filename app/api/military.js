document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.military-card');
    if (!card) return;

    const dayInMs = 24 * 60 * 60 * 1000;
    const dateToDay = value => Date.parse(`${value}T00:00:00Z`) / dayInMs;
    const enlistment = dateToDay(card.querySelector('#military-enlistment').dateTime);
    const discharge = dateToDay(card.querySelector('#military-discharge').dateTime);
    const totalDays = discharge - enlistment;
    const seoulDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const percentFormat = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 });
    let lastDay;

    const updateMilitaryService = () => {
        const parts = Object.fromEntries(seoulDate.formatToParts(new Date()).map(part => [part.type, part.value]));
        const today = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / dayInMs;
        if (today === lastDay) return;
        lastDay = today;

        const beforeEnlistment = today < enlistment;
        const completed = today >= discharge;
        const elapsedDays = Math.min(totalDays, Math.max(0, today - enlistment));
        const remainingDays = beforeEnlistment ? enlistment - today : Math.max(0, discharge - today);
        const percentage = elapsedDays / totalDays * 100;
        const percentageText = `${percentFormat.format(percentage)}%`;

        card.querySelector('#military-status').textContent = beforeEnlistment ? '입대 예정' : completed ? '복무 완료' : '복무중';
        card.querySelector('#military-remaining-label').textContent = beforeEnlistment ? '입대까지' : '전역까지';
        card.querySelector('#military-remaining').textContent = remainingDays.toLocaleString('ko-KR');
        card.querySelector('#military-percentage').textContent = percentageText;
        const progress = card.querySelector('#military-progress');
        progress.value = percentage;
        progress.textContent = percentageText;
        progress.setAttribute('aria-valuetext', percentageText);
        card.style.setProperty('--military-progress', `${percentage}%`);
    };

    updateMilitaryService();
    setInterval(updateMilitaryService, 60 * 1000);
    window.addEventListener('pageshow', updateMilitaryService);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) updateMilitaryService();
    });
});
