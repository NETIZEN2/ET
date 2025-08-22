import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { loadTrip } from '../scripts/data.js';

// mock fetch for local files
global.fetch = async (url)=>{
  const path = url.startsWith('/')?url.slice(1):url;
  const text = await readFile(path,'utf8');
  return { json: async()=>JSON.parse(text) };
};

const trip = await loadTrip();
assert.equal(trip.tripName,'Europe — Sep–Oct 2025');
console.log('data.test passed');
