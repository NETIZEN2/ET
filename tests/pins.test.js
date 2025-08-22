const assert = require('assert');
const fs = require('fs');
const { server } = require('../server.js');

(async () => {
  const pinsPath = 'pins.json';
  if (fs.existsSync(pinsPath)) fs.unlinkSync(pinsPath);

  const srv = server.listen(0);
  const port = srv.address().port;

  const pin = { name: 'Test Place', lat: 1, lon: 2 };

  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options) => {
    if (typeof url === 'string' && url.startsWith('http://localhost')) {
      return originalFetch(url, options);
    }
    calls.push({ url, options });
    return { ok: true, json: async () => ({}) };
  };
  process.env.GITHUB_TOKEN = 'token';
  process.env.GITHUB_REPO = 'owner/repo';

  let res = await fetch(`http://localhost:${port}/api/pins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pin)
  });
  assert.strictEqual(res.status, 201, 'Pin creation failed');

  const file = JSON.parse(fs.readFileSync(pinsPath));
  assert.deepStrictEqual(file[0], pin, 'Pin not saved to file');

  res = await fetch(`http://localhost:${port}/api/pins`);
  const list = await res.json();
  assert.deepStrictEqual(list[0], pin, 'Pin retrieval failed');

  assert(calls.some(c => c.url.includes('/contents/pins.json')), 'GitHub commit not triggered');

  srv.close();
  global.fetch = originalFetch;
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_REPO;
  fs.writeFileSync(pinsPath, '[]');
  console.log('Pins tests passed');
})();
