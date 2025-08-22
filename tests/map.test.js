const assert = require('assert');

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

class MockMap {
  constructor(opts) {
    this.center = opts.center;
    this.markers = [];
    global.__mapInstance = this;
  }
  setCenter(center) { this.center = center; }
}

class MockMarker {
  constructor(opts) { this.color = opts && opts.color; }
  setLngLat(ll) { this.lngLat = ll; return this; }
  addTo(map) { map.markers.push(this); return this; }
}

// Geolocation success places user and accommodation markers
{
  const document = createMockDocument();
  global.document = document;
  global.fetch = () => ({
    then: (resFn) => {
      resFn({ json: () => ({}) });
      return { then: (dataFn) => { dataFn({ query: { geosearch: [] } }); return { catch: () => {} }; } };
    }
  });
  global.TripLogic = {
    getItineraryForDate: () => ({ accommodation: { address: 'A', lat: 30, lon: 40 }, activities: [] }),
    getFreeTimeBlocks: () => []
  };
  global.navigator = { geolocation: { getCurrentPosition: (succ) => succ({ coords: { latitude: 10, longitude: 20 } }) } };
  global.mapboxgl = { Map: MockMap, Marker: MockMarker };
  const { initDashboard } = require('../app.js');
  initDashboard();
  assert.deepStrictEqual(global.__mapInstance.center, [20, 10], 'Map not centered on user');
  assert.deepStrictEqual(global.__mapInstance.markers.map(m => m.lngLat), [[20,10],[40,30]], 'Markers not placed');
  delete global.document; delete global.fetch; delete global.TripLogic; delete global.navigator; delete global.mapboxgl; delete global.__mapInstance;
  delete require.cache[require.resolve('../app.js')];
}

// Manual coordinate fallback when geolocation fails
{
  const document = createMockDocument();
  global.document = document;
  global.fetch = () => ({
    then: (resFn) => {
      resFn({ json: () => ({}) });
      return { then: (dataFn) => { dataFn({ query: { geosearch: [] } }); return { catch: () => {} }; } };
    }
  });
  global.TripLogic = {
    getItineraryForDate: () => ({ accommodation: { address: 'A', lat: 5, lon: 6 }, activities: [] }),
    getFreeTimeBlocks: () => []
  };
  global.navigator = { geolocation: { getCurrentPosition: (succ, err) => err() } };
  global.mapboxgl = { Map: MockMap, Marker: MockMarker };
  const { initDashboard } = require('../app.js');
  initDashboard();
  document.getElementById('manual-location').value = '1,2';
  document.getElementById('set-location').trigger('click');
  assert.deepStrictEqual(global.__mapInstance.center, [2,1], 'Manual coordinates not applied');
  assert.deepStrictEqual(global.__mapInstance.markers.map(m => m.lngLat)[0], [2,1], 'User marker not updated');
  delete global.document; delete global.fetch; delete global.TripLogic; delete global.navigator; delete global.mapboxgl; delete global.__mapInstance;
  delete require.cache[require.resolve('../app.js')];
}

console.log('Map integration tests passed');
