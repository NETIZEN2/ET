const assert = require('assert');
const { getItineraryForDate, getFreeTimeBlocks, haversineDistance, getLocalDateString } = require('../logic.js');

function createMockDocument() {
  const elements = {};
  return {
    getElementById: (id) => {
      if (!elements[id]) elements[id] = { textContent: '', innerHTML: '', href: '' };
      return elements[id];
    },
    addEventListener: () => {},
    querySelectorAll: () => [],
    elements
  };
}
const itinerary = require('../itinerary.js');

// Test itinerary retrieval from object structure
const directDay = itinerary['2023-09-14'];
assert(directDay.accommodation.name.includes('Pullman Paris'), 'Direct itinerary lookup failed');
const day = getItineraryForDate('2023-09-14');
assert.strictEqual(day, directDay, 'getItineraryForDate should retrieve using date key');

// Test local date retrieval across time zones
const date = new Date('2023-09-13T23:00:00Z');
assert.strictEqual(getLocalDateString(date, 'America/New_York'), '2023-09-13', 'NY date conversion failed');
assert.strictEqual(getLocalDateString(date, 'Europe/Paris'), '2023-09-14', 'Paris date conversion failed');

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
const blocks = getFreeTimeBlocks(sampleDay);
assert.deepStrictEqual(blocks, [
  { start: '00:00', end: '08:00' },
  { start: '10:00', end: '13:00' },
  { start: '14:00', end: '24:00' }
], 'Free time calculation failed');

// Test free time calculation with overlapping activities
const overlapDay = {
  activities: [
    { start: '08:00', end: '10:00', title: 'A1' },
    { start: '09:00', end: '11:00', title: 'A2' }
  ]
};
const overlapBlocks = getFreeTimeBlocks(overlapDay);
assert.deepStrictEqual(overlapBlocks, [
  { start: '00:00', end: '08:00' },
  { start: '11:00', end: '24:00' }
], 'Overlapping activities not handled correctly');

// Test handling when no itinerary exists
assert.strictEqual(getItineraryForDate('1900-01-01'), undefined, 'Missing itinerary should return undefined');
assert.throws(() => {
  const missing = getItineraryForDate('1900-01-01');
  if (!missing) throw new Error('Itinerary not found');
}, /Itinerary not found/, 'Missing itinerary not properly reported');

// Test getFreeTimeBlocks with no day
assert.deepStrictEqual(getFreeTimeBlocks(), [{ start: '00:00', end: '24:00' }], 'Free time for undefined day should cover entire day');

// Mocked geolocation success
{
  const mockDoc = createMockDocument();
  global.document = mockDoc;
  global.fetch = () => ({
    then: (resFn) => {
      resFn({ json: () => ({}) });
      return { then: (dataFn) => { dataFn({ results: [] }); return { catch: () => {} }; } };
    }
  });
  global.TripLogic = { getItineraryForDate: () => ({ accommodation: { address: 'Test' }, activities: [] }), getFreeTimeBlocks: () => [] };
  global.navigator = {
    geolocation: {
      getCurrentPosition: (success) => {
        success({ coords: { latitude: 10, longitude: 20 } });
      }
    }
  };
  delete require.cache[require.resolve('../app.js')];
  const { initDashboard } = require('../app.js');
  initDashboard();
  assert.strictEqual(document.getElementById('location').textContent, '10.0000, 20.0000', 'Geolocation success not processed');
  delete global.document; delete global.fetch; delete global.TripLogic; delete global.navigator;
}

// Mocked geolocation failure
{
  const mockDoc = createMockDocument();
  global.document = mockDoc;
  global.fetch = () => ({
    then: (resFn) => {
      resFn({ json: () => ({}) });
      return { then: (dataFn) => { dataFn({ results: [] }); return { catch: () => {} }; } };
    }
  });
  global.TripLogic = { getItineraryForDate: () => ({ accommodation: { address: 'Test' }, activities: [] }), getFreeTimeBlocks: () => [] };
  global.navigator = {
    geolocation: {
      getCurrentPosition: (success, error) => {
        error();
      }
    }
  };
  delete require.cache[require.resolve('../app.js')];
  const { initDashboard } = require('../app.js');
  initDashboard();
  assert.strictEqual(document.getElementById('location').textContent, 'Location unavailable', 'Geolocation failure not handled');
  delete global.document; delete global.fetch; delete global.TripLogic; delete global.navigator;
}

console.log('All tests passed');
