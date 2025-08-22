const fs = require('fs');
const { JSDOM } = require('jsdom');
const axe = require('axe-core');

(async () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const results = await axe.run(document);
  if (results.violations.length > 0) {
    console.error('Accessibility violations:', results.violations);
    process.exit(1);
  } else {
    console.log('No accessibility violations found');
  }
})();
