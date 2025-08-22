const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pinsFile = path.join(__dirname, 'pins.json');
const jwt = require('./jsonwebtoken');

const hashedPassword =
  process.env.HASHED_PASSWORD ||
  crypto.createHash('sha256').update('3urotrip_1997!').digest('hex');
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

async function commitPinsFile() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return;
  const content = fs.readFileSync(pinsFile, 'utf8');
  const base64 = Buffer.from(content).toString('base64');
  const headers = {
    'Authorization': `token ${token}`,
    'User-Agent': 'ET-App',
    'Content-Type': 'application/json'
  };
  let sha;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/pins.json`, { headers });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch {}
  await fetch(`https://api.github.com/repos/${repo}/contents/pins.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message: 'Update pins', content: base64, sha })
  });
}

function readPins() {
  if (fs.existsSync(pinsFile)) {
    try { return JSON.parse(fs.readFileSync(pinsFile)); } catch { return []; }
  }
  return [];
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
  if (req.method === 'POST' && req.url === '/api/pins') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const pin = JSON.parse(body || '{}');
        const pins = readPins();
        pins.push(pin);
        fs.writeFileSync(pinsFile, JSON.stringify(pins, null, 2));
        await commitPinsFile();
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return true;
  }
  if (req.method === 'GET' && req.url === '/api/pins') {
    const pins = readPins();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(pins));
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

module.exports = { server, sessions, commitPinsFile };
module.exports = { server, sessions, rateLimit };
