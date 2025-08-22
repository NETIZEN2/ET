const assert = require('assert');

function createMockDocument() {
  const elements = {};
  return {
    getElementById: (id) => {
      if (!elements[id]) elements[id] = { innerHTML: '', textContent: '' };
      return elements[id];
    },
    addEventListener: () => {},
    elements
  };
}

let mockDoc = createMockDocument();
global.document = mockDoc;
const { loadRoutes } = require('../app.js');

(async () => {
  // Successful fetch
  mockDoc = createMockDocument();
  global.document = mockDoc;
  global.fetch = (url) => {
    const mode = /mode=([^&]+)/.exec(url)[1];
    const durations = { transit: '20 mins', walking: '60 mins', driving: '15 mins' };
    return Promise.resolve({
      json: () => Promise.resolve({ routes: [{ legs: [{ duration: { text: durations[mode] } }] }] })
    });
  };
  await loadRoutes(1, 2, 'Some Place');
  const html = document.getElementById('routes').innerHTML;
  assert(html.includes('Transit: 20 mins'), 'Transit duration missing');
  assert(html.includes('Walking: 60 mins'), 'Walking duration missing');
  assert(html.includes('Taxi/Ride-share: 15 mins'), 'Taxi duration missing');
  delete global.document; delete global.fetch;

  // Failed fetch
  mockDoc = createMockDocument();
  global.document = mockDoc;
  global.fetch = () => Promise.reject(new Error('fail'));
  await loadRoutes(1, 2, 'Some Place');
  assert.strictEqual(document.getElementById('routes').textContent, 'Could not load route information', 'Failure message missing');
  delete global.document; delete global.fetch;
  console.log('Directions tests passed');
})();
