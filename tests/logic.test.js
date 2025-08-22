const assert = require('assert');
const { getItineraryForDate, getFreeTimeBlocks } = require('../logic.js');
const itinerary = require('../itinerary.js');
const { getItineraryForDate, getFreeTimeBlocks, getLocalDateString } = require('../logic.js');

// Test itinerary retrieval from object structure
const directDay = itinerary['2023-09-14'];
assert(directDay.accommodation.name.includes('Pullman Paris'), 'Direct itinerary lookup failed');
const day = getItineraryForDate('2023-09-14');
assert.strictEqual(day, directDay, 'getItineraryForDate should retrieve using date key');

// Test local date retrieval across time zones
const date = new Date('2023-09-13T23:00:00Z');
assert.strictEqual(getLocalDateString(date, 'America/New_York'), '2023-09-13', 'NY date conversion failed');
assert.strictEqual(getLocalDateString(date, 'Europe/Paris'), '2023-09-14', 'Paris date conversion failed');

// Test free time calculation
const sampleDay = {
  activities: [
    { start: '08:00', end: '10:00', title: 'Morning tour' },
    { start: '13:00', end: '14:00', title: 'Lunch' }
  ]
};
const blocks = getFreeTimeBlocks(sampleDay);
assert.deepStrictEqual(blocks, [
  { start: '00:00', end: '08:00' },
  { start: '10:00', end: '13:00' },
  { start: '14:00', end: '24:00' }
], 'Free time calculation failed');

console.log('All tests passed');
