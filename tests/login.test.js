const assert = require('assert');
const crypto = require('crypto');

process.env.HASHED_PASSWORD = crypto.createHash('sha256').update('eurotrip').digest('hex');
process.env.JWT_SECRET = 'testsecret';
process.env.TOKEN_EXPIRY_SECONDS = '1';

const { server, sessions, rateLimit } = require('../server.js');

(async () => {
  const srv = server.listen(0);
  const port = srv.address().port;
  const headers = { 'Content-Type': 'application/json', 'x-forwarded-proto': 'https' };

  let res = await fetch(`http://localhost:${port}/api/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ password: 'wrong' })
  });
  assert.strictEqual(res.status, 401, 'Should reject invalid password');

  res = await fetch(`http://localhost:${port}/api/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ password: 'eurotrip' })
  });
  assert.strictEqual(res.status, 200, 'Login should succeed');
  const data = await res.json();
  assert.ok(data.token, 'Token missing');

  res = await fetch(`http://localhost:${port}/api/validate`, {
    headers: { Authorization: `Bearer ${data.token}`, 'x-forwarded-proto': 'https' }
  });
  assert.strictEqual(res.status, 200, 'Token validation failed');

  await new Promise(r => setTimeout(r, 1100));
  res = await fetch(`http://localhost:${port}/api/validate`, {
    headers: { Authorization: `Bearer ${data.token}`, 'x-forwarded-proto': 'https' }
  });
  assert.strictEqual(res.status, 401, 'Expired token should be rejected');
  assert.strictEqual(sessions.size, 0, 'Expired session not purged');

  rateLimit.clear();
  let lastStatus;
  for (let i = 0; i < 5; i++) {
    res = await fetch(`http://localhost:${port}/api/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ password: 'wrong' })
    });
    lastStatus = res.status;
  }
  assert.strictEqual(lastStatus, 401, 'Pre-limit attempts should be processed');
  res = await fetch(`http://localhost:${port}/api/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ password: 'wrong' })
  });
  assert.strictEqual(res.status, 429, 'Should rate limit after too many requests');

  srv.close();
  console.log('Login tests passed');
})();
