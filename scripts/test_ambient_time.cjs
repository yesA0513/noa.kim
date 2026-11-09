const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'ambient-time.js'), 'utf8');
const load = (DateClass = Date) => {
    const context = { window: {}, Intl, Date: DateClass };
    vm.runInNewContext(source, context, { filename: 'ambient-time.js' });
    return context.window.noaAmbientTime;
};
const timeline = load();
const at = (minute, second = 0) => new Date(Date.UTC(2026, 10, 9, -9, minute, second));
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const boundaries = [
    [0, 'moonlit-voyage', '밤', 0],
    [300, 'cosmic-drift', '새벽', .2],
    [420, 'afterglow', '아침', .55],
    [540, 'aurora', '오전', .85],
    [720, 'deep-current', '낮', 1],
    [900, 'forest-whisper', '오후', .9],
    [1020, 'desert-dusk', '노을', .6],
    [1140, 'afterglow', '저녁', .3],
    [1260, 'cosmic-drift', '밤', .08],
    [1380, 'midnight-drive', '늦은 밤', .02],
];

test('exposes an immutable browser API and resolves explicit Seoul wall time', () => {
    assert.equal(timeline.zone, 'Asia/Seoul');
    assert.ok(Object.isFrozen(timeline));
    assert.equal(timeline.getSnapshot(new Date('2026-11-08T15:00:00Z')).time, '00:00');
    assert.equal(timeline.getSnapshot(new Date('2026-11-09T03:00:00Z')).time, '12:00');
    assert.equal(timeline.getSnapshot(new Date('2026-11-09T16:05:00Z')).time, '01:05');
    assert.equal(timeline.getSnapshot(new Date('2026-11-09T07:34:56-05:00')).time, '21:34');
});

test('every phase starts exactly on its Seoul boundary', () => {
    boundaries.forEach(([minute, scene, period, daylight], index) => {
        const snapshot = timeline.getSnapshot(at(minute));
        assert.equal(snapshot.scene, scene);
        assert.equal(snapshot.nextScene, boundaries[(index + 1) % boundaries.length][1]);
        assert.equal(snapshot.period, period);
        assert.equal(snapshot.blend, 0);
        assert.equal(snapshot.daylight, daylight);
        assert.equal(snapshot.time, `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`);

        const before = timeline.getSnapshot(at(minute, -1));
        const after = timeline.getSnapshot(at(minute, 1));
        assert.equal(before.scene, boundaries[(index + boundaries.length - 1) % boundaries.length][1]);
        assert.equal(after.scene, scene);
        assert.ok(after.blend > 0);
    });
});

test('interpolates RGB and daylight with smoothstep, including seconds', () => {
    const quarter = timeline.getSnapshot(at(75));
    close(quarter.blend, .15625);
    close(quarter.daylight, .03125);
    assert.deepEqual(Array.from(quarter.colors), ['#798ba2', '#6d778b', '#a9b2be']);
    close(timeline.getSnapshot(at(150)).blend, .5);
    close(timeline.getSnapshot(at(225)).blend, .84375);

    const subMinute = timeline.getSnapshot(at(0, 30));
    const progress = .5 / 300;
    close(subMinute.blend, progress * progress * (3 - 2 * progress));
    assert.ok(subMinute.blend > 0);
    assert.equal(subMinute.time, '00:00');
});

test('colors and daylight meet continuously across midnight', () => {
    const before = timeline.getSnapshot(at(1439, 59));
    const midnight = timeline.getSnapshot(at(1440));
    const after = timeline.getSnapshot(at(1440, 1));
    assert.equal(before.scene, 'midnight-drive');
    assert.equal(before.nextScene, 'moonlit-voyage');
    assert.ok(before.blend > .999999);
    assert.equal(midnight.scene, 'moonlit-voyage');
    assert.equal(midnight.time, '00:00');
    assert.deepEqual(Array.from(before.colors), Array.from(midnight.colors));
    assert.deepEqual(Array.from(after.colors), Array.from(midnight.colors));
    close(before.daylight, midnight.daylight, 1e-8);
    close(after.daylight, midnight.daylight, 1e-8);
});

test('all-day snapshots stay valid and returned colors do not mutate the schedule', () => {
    const scenes = new Set(boundaries.map(boundary => boundary[1]));
    for (let minute = 0; minute < 1440; minute += 1) {
        const snapshot = timeline.getSnapshot(at(minute, 37));
        assert.ok(scenes.has(snapshot.scene));
        assert.ok(scenes.has(snapshot.nextScene));
        assert.ok(Number.isFinite(snapshot.blend) && snapshot.blend >= 0 && snapshot.blend <= 1);
        assert.ok(Number.isFinite(snapshot.daylight) && snapshot.daylight >= 0 && snapshot.daylight <= 1);
        assert.equal(snapshot.colors.length, 3);
        snapshot.colors.forEach(color => assert.match(color, /^#[0-9a-f]{6}$/));
        assert.match(snapshot.time, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
    }
    timeline.getSnapshot(at(0)).colors[0] = '#ffffff';
    assert.equal(timeline.getSnapshot(at(0)).colors[0], '#71889f');
});

test('uses the current date by default and rejects invalid dates', () => {
    const fixed = at(1020, 22).getTime();
    class FixedDate extends Date {
        constructor(...args) { super(...(args.length ? args : [fixed])); }
        static now() { return fixed; }
    }
    const fixedTimeline = load(FixedDate);
    assert.equal(fixedTimeline.getSnapshot().time, '17:00');
    assert.equal(fixedTimeline.getSnapshot().period, '노을');
    assert.throws(() => timeline.getSnapshot(new Date(NaN)), RangeError);
});
