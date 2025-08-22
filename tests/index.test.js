const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

assert(!/<input[^>]*id="password"/i.test(html), 'Password field should be removed');
assert(/<div id="dashboard"/i.test(html), 'Dashboard should be present');

console.log('index.html tests passed');
