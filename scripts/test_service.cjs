const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../app/api/service.js'), 'utf8');
let checks = 0;

function render(instant, enlistment = '2026-03-09', discharge = '2027-09-08', omitted = []) {
    let current = instant;
    class MockDate extends Date {
        constructor(...args) { super(...(args.length ? args : [current])); }
    }
    const nodes = {};
    for (const name of ['status', 'countdown', 'day-caption', 'date', 'progress-row', 'progress-value', 'progress', 'days-note']) {
        if (omitted.includes(name)) continue;
        nodes[`.service-${name}`] = {
            textContent: '', hidden: true, value: 0, attributes: {},
            setAttribute(key, value) { this.attributes[key] = value; },
            removeAttribute(key) { delete this.attributes[key]; }
        };
    }
    const card = { dataset: { dischargeDate: discharge, enlistmentDate: enlistment }, querySelector: selector => nodes[selector] || null };
    const listeners = {};
    let pendingTimer;
    const document = {
        hidden: false,
        querySelector: selector => selector === '.service-card' ? card : null,
        addEventListener: (name, handler) => { listeners[name] = handler; }
    };
    vm.runInNewContext(source, {
        document, Date: MockDate, Intl,
        setTimeout: (handler, delay) => { pendingTimer = { handler, delay }; return 1; },
        clearTimeout: () => { pendingTimer = undefined; }
    });
    listeners.DOMContentLoaded();
    return {
        nodes, document, listeners,
        timer: () => pendingTimer,
        advance: value => { current = value; },
        text: name => nodes[`.service-${name}`]?.textContent
    };
}

const initial = render('2026-10-11T15:00:00.000Z');
assert.equal(initial.text('countdown'), 'D-331');
assert.equal(initial.text('progress-value'), '39.6%');
assert.equal(initial.nodes['.service-progress'].value, 39.6);
assert.equal(initial.nodes['.service-progress-row'].hidden, false);
assert.equal(initial.text('date'), '2027.09.08');
assert.equal(initial.text('days-note'), '2026.03.09 입대');
checks++;

const midnight = render('2026-10-11T14:59:59.000Z');
assert.equal(midnight.text('countdown'), 'D-332');
assert.equal(midnight.timer().delay, 1050);
midnight.advance('2026-10-11T15:00:00.050Z');
midnight.timer().handler();
assert.equal(midnight.text('countdown'), 'D-331');
checks++;

for (const [instant, expected, status, progress] of [
    ['2027-09-06T15:00:00Z', 'D-1', '대한민국 육군 복무 중', '99.8%'],
    ['2027-09-07T15:00:00Z', 'D-DAY', '오늘 전역해요', '100.0%'],
    ['2027-09-08T15:00:00Z', 'D+1', '육군 전역', '100.0%'],
    ['2026-03-07T15:00:00Z', 'D-549', '육군 입대 예정', '0.0%'],
    ['2026-03-08T15:00:00Z', 'D-548', '대한민국 육군 복무 중', '0.0%']
]) {
    const result = render(instant);
    assert.equal(result.text('countdown'), expected);
    assert.equal(result.text('status'), status);
    assert.equal(result.text('progress-value'), progress);
    checks++;
}

const halfway = render('2026-03-09T15:00:00Z', '2026-03-09', '2026-03-11');
assert.equal(halfway.text('progress-value'), '50.0%');
assert.equal(halfway.nodes['.service-progress'].attributes['aria-valuetext'], '50.0%');
checks++;

for (const invalid of ['', '2026-02-30', '2025-02-29', '2027-09-08', '2028-01-01', '2026-3-09', '2026-13-09', '0000-01-01']) {
    const result = render('2026-10-11T15:00:00Z', invalid);
    assert.equal(result.text('countdown'), 'D-331');
    assert.equal(result.nodes['.service-progress-row'].hidden, true);
    assert.equal(result.text('progress-value'), '');
    checks++;
}

for (const invalid of ['', '2027-02-29', 'invalid', '2027-09-31']) {
    const result = render('2026-10-11T15:00:00Z', '2026-03-09', invalid);
    assert.equal(result.text('countdown'), '—');
    assert.equal(result.text('status'), '복무 정보 확인 필요');
    assert.equal(result.text('date'), '날짜 확인 필요');
    assert.equal(result.nodes['.service-progress-row'].hidden, true);
    assert.equal(result.timer(), undefined);
    checks++;
}

const leap = render('2028-02-28T15:00:00Z', '2028-02-28', '2028-03-01');
assert.equal(leap.text('countdown'), 'D-1');
assert.equal(leap.text('progress-value'), '50.0%');
checks++;

const visibility = render('2026-10-11T14:00:00Z');
visibility.document.hidden = true;
visibility.listeners.visibilitychange();
assert.equal(visibility.timer(), undefined);
visibility.advance('2026-10-12T15:00:00Z');
visibility.document.hidden = false;
visibility.listeners.visibilitychange();
assert.equal(visibility.text('countdown'), 'D-330');
assert.ok(visibility.timer());
checks++;

assert.doesNotThrow(() => render('2026-10-11T15:00:00Z', '2026-03-09', '2027-09-08', [
    'status', 'countdown', 'day-caption', 'date', 'progress-row', 'progress-value', 'progress', 'days-note'
]));
checks++;

console.log(`service.js: ${checks} regressions passed (host TZ: ${process.env.TZ || 'default'})`);
