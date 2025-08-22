const assert = require('assert');
const { server } = require('../server.js');

async function run() {
  await new Promise((resolve, reject) => {
    const listener = server.listen(0, async () => {
      const port = listener.address().port;
      try {
        const res = await fetch(`http://localhost:${port}/api/itinerary`);
        assert.strictEqual(res.status, 200, 'should return 200');
        const data = await res.json();
        assert(Array.isArray(data), 'should return an array');
        assert(data.length > 0, 'array should not be empty');
        assert.ok(data[0].date, 'entries should have date');
        listener.close();
        console.log('itinerary endpoint tests passed');
        resolve();
      } catch (e) {
        listener.close();
        reject(e);
      }
    });
  });
}

run().catch(err => { console.error(err); process.exit(1); });
