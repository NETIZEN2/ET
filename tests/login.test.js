const assert = require('assert');

process.env.PASSWORD = '3urotrip_1997!';

const { server } = require('../server.js');

(async () => {
  const srv = server.listen(0);
  const port = srv.address().port;
  const headers = { 'Content-Type': 'application/json' };

  let res = await fetch(`http://localhost:${port}/api/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ password: 'wrong' })
  });
  assert.strictEqual(res.status, 401, 'Should reject invalid password');

  res = await fetch(`http://localhost:${port}/api/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ password: '3urotrip_1997!' })
  });
  assert.strictEqual(res.status, 200, 'Login should succeed');

  srv.close();
  console.log('Login tests passed');
})();

