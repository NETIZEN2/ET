const assert = require('assert');
const {
  getItineraryForDate,
  getFreeTimeBlocks,
  getLocalDateString,
  haversineDistance
} = require('../logic.js');
const itinerary = require('../itinerary.js');

// itinerary lookup
assert.strictEqual(
  getItineraryForDate('2023-09-14'),
  itinerary['2023-09-14'],
  'getItineraryForDate should return matching day'
);

// timezone handling
const date = new Date('2023-09-13T23:00:00Z');
assert.strictEqual(getLocalDateString(date, 'America/New_York'), '2023-09-13');
assert.strictEqual(getLocalDateString(date, 'Europe/Paris'), '2023-09-14');

// free time calculation
const sampleDay = {
  activities: [
    { start: '08:00', end: '10:00' },
    { start: '13:00', end: '14:00' }
  ]
};
assert.deepStrictEqual(getFreeTimeBlocks(sampleDay), [
  { start: '00:00', end: '08:00' },
  { start: '10:00', end: '13:00' },
  { start: '14:00', end: '24:00' }
]);

// free time when day missing
assert.deepStrictEqual(getFreeTimeBlocks(), [{ start: '00:00', end: '24:00' }]);

// haversine distance
const dist = haversineDistance(0, 0, 0, 1);
assert(Math.abs(dist - 111.19) < 0.5, 'Haversine distance incorrect');

console.log('logic tests passed');

