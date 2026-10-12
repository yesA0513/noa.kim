document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.service-card');
    if (!card) return;

    const status = card.querySelector('.service-status');
    const countdown = card.querySelector('.service-countdown');
    const caption = card.querySelector('.service-day-caption');
    const date = card.querySelector('.service-date');
    const progressRow = card.querySelector('.service-progress-row');
    const progressValue = card.querySelector('.service-progress-value');
    const progress = card.querySelector('.service-progress');
    const daysNote = card.querySelector('.service-days-note');
    const dayLength = 24 * 60 * 60 * 1000;
    const seoulOffset = 9 * 60 * 60 * 1000;
    const seoulCalendar = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    });

    const parseDate = (value) => {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
        if (!match) return null;
        const [, yearText, monthText, dayText] = match;
        const year = Number(yearText);
        const month = Number(monthText);
        const day = Number(dayText);
        if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;

        // UTC ordinals compare calendar dates without host timezone or DST effects.
        const parsed = new Date(0);
        parsed.setUTCFullYear(year, month - 1, day);
        parsed.setUTCHours(0, 0, 0, 0);
        if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
        return { value, ordinal: parsed.getTime() / dayLength };
    };

    const getSeoulDay = (now) => {
        const parts = seoulCalendar.formatToParts(now);
        const part = (type) => parts.find(item => item.type === type).value;
        return parseDate(`${part('year').padStart(4, '0')}-${part('month')}-${part('day')}`).ordinal;
    };

    const setText = (element, value) => {
        if (element) element.textContent = value;
    };
    const hideProgress = () => {
        if (progressRow) progressRow.hidden = true;
        if (progress) {
            progress.value = 0;
            progress.removeAttribute('aria-valuetext');
        }
        setText(progressValue, '');
        if (daysNote) daysNote.hidden = true;
    };

    let midnightTimer;
    const update = () => {
        clearTimeout(midnightTimer);
        const discharge = parseDate(card.dataset.dischargeDate);
        if (!discharge) {
            setText(status, '복무 정보 확인 필요');
            setText(countdown, '—');
            setText(caption, '전역일을 확인해 주세요');
            if (date) {
                date.removeAttribute('datetime');
                date.textContent = '날짜 확인 필요';
            }
            hideProgress();
            return;
        }

        const now = new Date();
        const today = getSeoulDay(now);
        const remaining = discharge.ordinal - today;
        const enlistment = parseDate(card.dataset.enlistmentDate);
        const hasServicePeriod = enlistment && enlistment.ordinal < discharge.ordinal;
        const beforeEnlistment = hasServicePeriod && today < enlistment.ordinal;
        setText(status, remaining > 0 ? (beforeEnlistment ? '육군 입대 예정' : '대한민국 육군 복무 중')
            : remaining === 0 ? '오늘 전역해요' : '육군 전역');
        setText(countdown, remaining > 0 ? `D-${remaining}` : remaining === 0 ? 'D-DAY' : `D+${-remaining}`);
        setText(caption, remaining > 0 ? '전역까지 남은 날짜' : remaining === 0 ? '전역일' : '전역 후 지난 날짜');
        if (date) {
            date.setAttribute('datetime', discharge.value);
            date.textContent = discharge.value.replaceAll('-', '.');
        }

        if (hasServicePeriod) {
            const percentage = Math.max(0, Math.min(100,
                (today - enlistment.ordinal) / (discharge.ordinal - enlistment.ordinal) * 100));
            const label = `${percentage.toFixed(1)}%`;
            if (progressRow) progressRow.hidden = false;
            setText(progressValue, label);
            if (progress) {
                progress.max = 100;
                progress.value = Number(percentage.toFixed(1));
                progress.setAttribute('aria-label', '복무 진행률');
                progress.setAttribute('aria-valuetext', label);
            }
            if (daysNote) {
                daysNote.hidden = false;
                daysNote.textContent = `${enlistment.value.replaceAll('-', '.')} 입대`;
            }
        } else {
            hideProgress();
        }

        if (!document.hidden) {
            const nextMidnight = (today + 1) * dayLength - seoulOffset;
            midnightTimer = setTimeout(update, Math.max(1000, nextMidnight - now.getTime() + 50));
        }
    };

    update();
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearTimeout(midnightTimer);
        else update();
    });
});
