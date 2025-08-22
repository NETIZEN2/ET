const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const hashedPassword = process.env.HASHED_PASSWORD || '';
const jwtSecret = process.env.JWT_SECRET || 'secret';
const TOKEN_EXPIRY_SECONDS = parseInt(process.env.TOKEN_EXPIRY_SECONDS, 10) || 3600;

const sessions = new Map(); // token -> expiry timestamp
const rateLimit = new Map(); // ip -> { count, start }
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60000;

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimit.get(ip) || { count: 0, start: now };
  if (now - record.start > RATE_LIMIT_WINDOW_MS) {
    record.count = 0;
    record.start = now;
  }
  record.count++;
  rateLimit.set(ip, record);
  return record.count > RATE_LIMIT_MAX;
}

function purgeSessions() {
  const now = Date.now();
  for (const [token, exp] of sessions.entries()) {
    if (exp <= now) sessions.delete(token);
  }
}

function handleApi(req, res) {
  if (req.method === 'POST' && req.url === '/api/login') {
    const ip = req.socket.remoteAddress;
    if (isRateLimited(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too many requests' }));
      return true;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { password } = JSON.parse(body || '{}');
        const hashed = crypto.createHash('sha256').update(password || '').digest('hex');
        if (hashed === hashedPassword) {
          const token = jwt.sign({ sid: crypto.randomBytes(8).toString('hex') }, jwtSecret, { expiresIn: TOKEN_EXPIRY_SECONDS });
          const expiry = Date.now() + TOKEN_EXPIRY_SECONDS * 1000;
          sessions.set(token, expiry);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ token }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return true;
  }
  if (req.method === 'GET' && req.url === '/api/validate') {
    purgeSessions();
    const auth = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '');
    if (sessions.has(token)) {
      try {
        jwt.verify(token, jwtSecret);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: true }));
      } catch {
        sessions.delete(token);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: false }));
      }
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false }));
    }
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted;
  if (!isSecure) {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
    return;
  }
  if (handleApi(req, res)) return;
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const types = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
      };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
});

if (require.main === module) {
  server.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = { server, sessions, rateLimit };
