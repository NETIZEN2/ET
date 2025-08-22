const assert = require('assert');
const { getItineraryForDate, getFreeTimeBlocks, haversineDistance } = require('../logic.js');
const itinerary = require('../itinerary.js');
const { getItineraryForDate, getFreeTimeBlocks, haversineDistance, getLocalDateString } = require('../logic.js');
const itinerary = require('../itinerary.js');

function createMockDocument() {
  const elements = {};
  return {
    getElementById: (id) => {
      if (!elements[id]) elements[id] = { textContent: '', innerHTML: '', href: '' };
      return elements[id];
    },
    addEventListener: () => {},
    elements
  };
}

// Test itinerary retrieval from object structure
const day = getItineraryForDate('2023-09-14');
assert.strictEqual(day, itinerary['2023-09-14'], 'getItineraryForDate should retrieve using date key');

// Test haversineDistance with a known value
const dist = haversineDistance(0, 0, 0, 1);
assert(Math.abs(dist - 111.19) < 0.5, 'Haversine distance calculation failed');

// Test free time calculation with non-overlapping activities
const sampleDay = {
  activities: [
    { start: '08:00', end: '10:00', title: 'Morning tour' },
    { start: '13:00', end: '14:00', title: 'Lunch' }
  ]
};
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
