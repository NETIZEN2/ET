const assert = require('assert');
const itinerary = require('../itinerary.js');
const { getItineraryForDate, getLocalDateString, getFreeTimeBlocks, haversineDistance } = require('../logic.js');

// verify itinerary retrieval and new fields
const day = getItineraryForDate('2023-09-15');
assert(day.accommodation.bookingRef === 'XYZ123', 'Booking reference missing');
assert(day.activities[0].description.includes('Eiffel Tower'), 'Activity description missing');

// ensure direct lookup still works
assert(itinerary['2023-09-15'].accommodation.bookingRef === 'XYZ123', 'Itinerary object not updated');

// test date conversions
const date = new Date('2023-09-13T23:00:00Z');
assert.strictEqual(getLocalDateString(date, 'America/New_York'), '2023-09-13');
assert.strictEqual(getLocalDateString(date, 'Europe/Paris'), '2023-09-14');
const { getItineraryForDate, getFreeTimeBlocks, getLocalDateString, haversineDistance } = require('../logic.js');
const { getItineraryForDate, getFreeTimeBlocks, haversineDistance } = require('../logic.js');
const itinerary = require('../itinerary.js');
const { getItineraryForDate, getFreeTimeBlocks, haversineDistance, getLocalDateString } = require('../logic.js');
const itinerary = require('../itinerary.js');

function createMockDocument() {
  const elements = {};
  return {
    getElementById: (id) => {
      if (!elements[id]) elements[id] = {
        textContent: '',
        innerHTML: '',
        href: '',
        style: {},
        value: '',
        addEventListener: function (event, fn) { this['on' + event] = fn; },
        trigger: function (event) { if (this['on' + event]) this['on' + event](); }
      };
      return elements[id];
    },
    addEventListener: () => {},
    elements
  };
}

// Test itinerary retrieval from object structure
const day = getItineraryForDate('2023-09-14');
assert.strictEqual(day, itinerary['2023-09-14'], 'getItineraryForDate should retrieve using date key');

// test haversine distance
const dist = haversineDistance(0,0,0,1);
assert(Math.abs(dist - 111.19) < 0.5, 'Haversine distance incorrect');

// test free time calculation
const sampleDay = {
  activities: [
    { start: '08:00', end: '10:00' },
    { start: '13:00', end: '14:00' }
  ]
};
<assert.deepStrictEqual(getFreeTimeBlocks(sampleDay), [
  { start: '00:00', end: '08:00' },
  { start: '10:00', end: '13:00' },
  { start: '14:00', end: '24:00' }
]);
assert.deepStrictEqual(
  getFreeTimeBlocks(sampleDay),
  [
    { start: '00:00', end: '08:00' },
    { start: '10:00', end: '13:00' },
    { start: '14:00', end: '24:00' }
  ],
  'Free time calculation failed'
);

// Test free time calculation with overlapping activities
const overlapDay = {
  activities: [
    { start: '08:00', end: '10:00', title: 'A1' },
    { start: '09:00', end: '11:00', title: 'A2' }
  ]
};
assert.deepStrictEqual(
  getFreeTimeBlocks(overlapDay),
  [
    { start: '00:00', end: '08:00' },
    { start: '11:00', end: '24:00' }
  ],
  'Overlapping activities not handled correctly'
);

// Test handling when no itinerary exists
assert.strictEqual(getItineraryForDate('1900-01-01'), undefined, 'Missing itinerary should return undefined');

// Test getFreeTimeBlocks with no day
assert.deepStrictEqual(
  getFreeTimeBlocks(),
  [{ start: '00:00', end: '24:00' }],
  'Free time for undefined day should cover entire day'
);

console.log('logic tests passed');
