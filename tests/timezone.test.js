const assert = require('assert');
const { getLocalDateString } = require('../logic.js');

const date = new Date('2023-09-13T23:00:00Z');

const cases = [
  ['America/New_York', '2023-09-13'],
  ['Europe/Paris', '2023-09-14'],
  ['Asia/Tokyo', '2023-09-14']
];

for (const [tz, expected] of cases) {
  assert.strictEqual(
    getLocalDateString(date, tz),
    expected,
    `${tz} conversion failed`
  );
}

console.log('getLocalDateString timezone tests passed');
