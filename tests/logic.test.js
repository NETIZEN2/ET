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
assert.deepStrictEqual(getFreeTimeBlocks(sampleDay), [
  { start: '00:00', end: '08:00' },
  { start: '10:00', end: '13:00' },
  { start: '14:00', end: '24:00' }
]);

console.log('logic tests passed');
