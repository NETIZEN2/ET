import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const html = readFileSync('./index.html','utf8');
const match = html.match(/<div class="segmented"[\s\S]*?<\/div>/);
assert.ok(match, 'segmented control exists');
const buttons = match[0].match(/<button/g) || [];
assert.equal(buttons.length,3);
console.log('structure.test passed');
