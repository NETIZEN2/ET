const assert = require('assert');
const { server } = require('../server.js');

(async () => {
  const srv = server.listen(0);
  const port = srv.address().port;

  let res = await fetch(`http://localhost:${port}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrong' })
  });
  assert.strictEqual(res.status, 401, 'Should reject invalid password');

  res = await fetch(`http://localhost:${port}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'eurotrip' })
  });
  assert.strictEqual(res.status, 200, 'Login should succeed');
  const data = await res.json();
  assert.ok(data.token, 'Token missing');

  res = await fetch(`http://localhost:${port}/api/validate`, {
    headers: { 'Authorization': `Bearer ${data.token}` }
  });
  assert.strictEqual(res.status, 200, 'Token validation failed');

  srv.close();
  console.log('Login tests passed');
})();
