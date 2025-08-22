const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

assert(/<html[^>]*lang="en"/i.test(html), 'Missing lang attribute on html element');
assert(/<meta[^>]*name="viewport"/i.test(html), 'Missing viewport meta tag');

console.log('accessibility checks passed');

