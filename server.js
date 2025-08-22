const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pinsFile = path.join(__dirname, 'pins.json');

const hashedPassword = crypto.createHash('sha256').update('eurotrip').digest('hex');
const sessions = new Set();

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
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { password } = JSON.parse(body || '{}');
        const hashed = crypto.createHash('sha256').update(password || '').digest('hex');
        if (hashed === hashedPassword) {
          const token = crypto.randomBytes(16).toString('hex');
          sessions.add(token);
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
    const auth = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '');
    if (sessions.has(token)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: true }));
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
