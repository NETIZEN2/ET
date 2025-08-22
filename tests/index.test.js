const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const labelRegex = /<label[^>]*for="password"[^>]*>\s*Password\s*<input[^>]*id="password"[^>]*aria-describedby="password-hint"[^>]*>\s*<\/label>/i;
assert(labelRegex.test(html), 'Password input not wrapped in label with aria-describedby');

const hintRegex = /<p[^>]*id="password-hint"[^>]*>.*?<\/p>/i;
assert(hintRegex.test(html), 'Password hint missing');

const buttonRegex = /<button[^>]*type="submit"[^>]*aria-label="Submit password"[^>]*>\s*Enter\s*<\/button>/i;
assert(buttonRegex.test(html), 'Submit button missing aria-label');

console.log('index.html accessibility tests passed');
