const assert = require('assert');

// minimal DOM stubs
function createElement() {
  return {
    innerHTML: '',
    textContent: '',
    style: {},
    value: '',
    href: '',
    addEventListener: () => {}
  };
}
const elements = {};
['login','dashboard','itinerary','free-time','suggestions','pinned','manual-location-container','manual-location','set-location','location','maps-link','date-picker','prev-date','next-date'].forEach(id => {
  elements[id] = createElement();
});

global.document = {
  getElementById: (id) => elements[id],
  querySelectorAll: () => [],
  addEventListener: () => {}
};

global.localStorage = (() => {
  const store = {};
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
})();

global.navigator = {};

global.TripLogic = require('../logic.js');
let fetchCount = 0;
global.fetch = () => Promise.resolve({
  json: () => Promise.resolve({ query: { geosearch: [{ title: `Place${++fetchCount}` }] } })
});

const { initDashboard } = require('../app.js');

localStorage.setItem('pinned-2023-09-13', JSON.stringify(['Pinned13']));
localStorage.setItem('pinned-2023-09-14', JSON.stringify(['Pinned14']));
localStorage.setItem('manualLocation', '1,2');

(async () => {
  await initDashboard('2023-09-13');
  await new Promise(r => setTimeout(r, 0));
  assert(elements['itinerary'].innerHTML.includes('Pullman Paris'), 'Itinerary for 13 missing');
  assert(elements['pinned'].innerHTML.includes('Pinned13'), 'Pinned for 13 missing');
  assert(elements['suggestions'].innerHTML.includes('Place1'), 'Suggestions not loaded');

  await initDashboard('2023-09-14');
  await new Promise(r => setTimeout(r, 0));
  assert(elements['itinerary'].innerHTML.includes('Paris in a Day Tour'), 'Itinerary for 14 missing');
  assert(elements['pinned'].innerHTML.includes('Pinned14'), 'Pinned for 14 missing');
  assert(elements['suggestions'].innerHTML.includes('Place2'), 'Suggestions not refreshed');
  assert.strictEqual(localStorage.getItem('lastDate'), '2023-09-14');
  console.log('Date navigation tests passed');
})();
