const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(JSON.stringify(input)).toString('base64url');
}

function sign(payload, secret, options = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = options.expiresIn
    ? Math.floor(Date.now() / 1000) + options.expiresIn
    : undefined;
  const body = { ...payload };
  if (exp) body.exp = exp;
  const headerPart = base64url(header);
  const payloadPart = base64url(body);
  const data = `${headerPart}.${payloadPart}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

function verify(token, secret) {
  const [headerPart, payloadPart, signature] = token.split('.');
  const data = `${headerPart}.${payloadPart}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  if (signature !== expected) throw new Error('invalid signature');
  const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('jwt expired');
  }
  return payload;
}

module.exports = { sign, verify };
