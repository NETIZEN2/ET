const assert = require('assert');
global.TripLogic = require('../logic.js');

function createMockDocument() {
  const elements = {};
  function createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      children: [],
      textContent: '',
      className: '',
      value: '',
      addEventListener(event, handler) { this['on' + event] = handler; },
      dispatchEvent(event) { if (this['on' + event.type]) this['on' + event.type](event); },
      appendChild(child) { this.children.push(child); },
      setAttribute(name, value) {
        this[name] = value;
        if (name === 'id') elements[value] = this;
        if (name === 'class') this.className = value;
      },
      getAttribute(name) { return this[name]; }
    };
  }
  return {
    createElement,
    getElementById(id) {
      if (!elements[id]) elements[id] = createElement('div');
      return elements[id];
    },
    createTextNode(text) {
      return { tagName: '#text', textContent: text, children: [], appendChild(){}, addEventListener(){}, dispatchEvent(){}, setAttribute(){} };
    },
    addEventListener() {},
    elements
  };
}

const document = createMockDocument();
global.document = document;

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

let highlighted;
global.highlightMarker = (addr) => { highlighted = addr; };

const day = {
  accommodation: {
    name: 'Test Hotel',
    address: '123 Street',
    checkIn: '14:00',
    checkOut: '11:00',
    bookingRef: 'ABC123'
  },
  activities: [
    { start: '09:00', end: '10:00', title: 'Museum', description: 'Visit museum' }
  ],
  travel: 'Bus to city'
};

const { displayItinerary } = require('../app.js');
displayItinerary(day);

const itineraryContainer = document.getElementById('itinerary');
function gatherText(el) {
  return [el.textContent, ...el.children.map(gatherText)].join(' ');
}
const text = gatherText(itineraryContainer);
assert(text.includes('Check-in: 14:00'), 'Check-in missing');
assert(text.includes('Booking ref: ABC123'), 'Booking ref missing');

const addr = document.elements['acc-address'];
addr.dispatchEvent({ type: 'click', preventDefault(){} });
assert.strictEqual(highlighted, '123 Street', 'Marker not highlighted');

const notes = [];
(function findTextareas(el){
  if (el.tagName === 'TEXTAREA') notes.push(el);
  el.children.forEach(findTextareas);
})(itineraryContainer);
assert.strictEqual(notes.length, 1, 'Notes textarea missing');
notes[0].value = 'Great!';
notes[0].dispatchEvent({ type: 'input' });
assert.strictEqual(localStorage.getItem('note-0'), 'Great!', 'Note not saved');

console.log('display tests passed');
