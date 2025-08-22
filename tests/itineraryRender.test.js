const assert = require('assert');

function createMockDocument() {
  const elements = {};
  function createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      children: [],
      textContent: '',
      appendChild(child) { this.children.push(child); },
      setAttribute(name, value) { if (name === 'id') elements[value] = this; },
      addEventListener() {}
    };
  }
  return {
    createElement,
    getElementById(id) {
      if (!elements[id]) elements[id] = createElement('div');
      return elements[id];
    },
    elements,
    addEventListener() {}
  };
}

const document = createMockDocument();
global.document = document;

const { renderItineraryList } = require('../app.js');

renderItineraryList([
  { date: '2023-09-12', location: 'Paris', notes: 'Arrive' }
]);

const container = document.getElementById('itinerary-list');
assert.strictEqual(container.children.length, 1, 'Itinerary item not rendered');
const summary = container.children[0].children[0];
assert(summary.textContent.includes('2023-09-12'), 'Date missing in summary');
console.log('itinerary render tests passed');
