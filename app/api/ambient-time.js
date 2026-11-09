(() => {
    const zone = 'Asia/Seoul';
    const clock = new Intl.DateTimeFormat('en-GB', {
        timeZone: zone,
        hourCycle: 'h23',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const frames = [
        { minute: 0, scene: 'moonlit-voyage', period: '밤', daylight: 0, colors: ['#71889f', '#657487', '#a5b3bf'] },
        { minute: 300, scene: 'cosmic-drift', period: '새벽', daylight: .2, colors: ['#a79bb5', '#9b869e', '#c1adb8'] },
        { minute: 420, scene: 'afterglow', period: '아침', daylight: .55, colors: ['#c8aaa2', '#b7aaa4', '#decbbb'] },
        { minute: 540, scene: 'aurora', period: '오전', daylight: .85, colors: ['#9bb7ad', '#95adb0', '#cbd7c9'] },
        { minute: 720, scene: 'deep-current', period: '낮', daylight: 1, colors: ['#91b4c6', '#8ca4bb', '#c9d9dd'] },
        { minute: 900, scene: 'forest-whisper', period: '오후', daylight: .9, colors: ['#a8bba0', '#91a797', '#d1d6b9'] },
        { minute: 1020, scene: 'desert-dusk', period: '노을', daylight: .6, colors: ['#ccb18c', '#bd9b85', '#e0c9a8'] },
        { minute: 1140, scene: 'afterglow', period: '저녁', daylight: .3, colors: ['#bda0a6', '#a18da5', '#ccb6b0'] },
        { minute: 1260, scene: 'cosmic-drift', period: '밤', daylight: .08, colors: ['#8c89aa', '#737b98', '#b1a6bf'] },
        { minute: 1380, scene: 'midnight-drive', period: '늦은 밤', daylight: .02, colors: ['#9f8997', '#7b7b92', '#b3a6ad'] },
    ];
    const clamp = value => Math.max(0, Math.min(1, value));
    const smoothstep = value => value * value * (3 - 2 * value);
    const mixColor = (from, to, amount) => {
        const channels = [1, 3, 5].map(offset => {
            const start = parseInt(from.slice(offset, offset + 2), 16);
            const end = parseInt(to.slice(offset, offset + 2), 16);
            return Math.round(start + (end - start) * amount).toString(16).padStart(2, '0');
        });
        return `#${channels.join('')}`;
    };

    const getSnapshot = (date = new Date()) => {
        const parts = clock.formatToParts(date);
        const part = type => parts.find(value => value.type === type).value;
        const hour = part('hour');
        const minute = part('minute');
        const position = Number(hour) * 60 + Number(minute) + Number(part('second')) / 60;
        let index = frames.length - 1;
        while (index > 0 && frames[index].minute > position) index -= 1;
        const current = frames[index];
        const next = frames[(index + 1) % frames.length];
        const end = next.minute > current.minute ? next.minute : next.minute + 1440;
        const blend = smoothstep(clamp((position - current.minute) / (end - current.minute)));

        return {
            scene: current.scene,
            nextScene: next.scene,
            blend,
            colors: current.colors.map((color, colorIndex) => mixColor(color, next.colors[colorIndex], blend)),
            daylight: clamp(current.daylight + (next.daylight - current.daylight) * blend),
            period: current.period,
            time: `${hour}:${minute}`,
        };
    };

    window.noaAmbientTime = Object.freeze({ zone, getSnapshot });
})();
