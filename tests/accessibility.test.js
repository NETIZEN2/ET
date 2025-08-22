const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

assert(/<html[^>]*lang="en"/i.test(html), 'Missing lang attribute on html element');
assert(/<meta[^>]*name="viewport"/i.test(html), 'Missing viewport meta tag');
assert(/<meta[^>]*name="apple-mobile-web-app-capable"/i.test(html), 'Missing Apple mobile web app capability meta tag');

console.log('accessibility checks passed');

