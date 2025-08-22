const http = require('http');
const fs = require('fs');
const path = require('path');
const itinerary = require('./itinerary.js');

const pinsFile = path.join(__dirname, 'pins.json');

function readPins() {
  if (fs.existsSync(pinsFile)) {
    try {
      return JSON.parse(fs.readFileSync(pinsFile));
    } catch {
      return [];
    }
  }
  return [];
}

function handleApi(req, res) {
  if (req.method === 'POST' && req.url === '/api/pins') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const pin = JSON.parse(body || '{}');
        const pins = readPins();
        pins.push(pin);
        fs.writeFileSync(pinsFile, JSON.stringify(pins, null, 2));
        const repo = process.env.GITHUB_REPO;
        const token = process.env.GITHUB_TOKEN;
        if (repo && token && typeof fetch === 'function') {
          const content = Buffer.from(JSON.stringify(pins, null, 2)).toString('base64');
          fetch(`https://api.github.com/repos/${repo}/contents/pins.json`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: 'Update pins', content })
          }).catch(() => {});
        }
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
  if (req.method === 'GET' && req.url === '/api/itinerary') {
    const entries = itinerary.entries || [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(entries));
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  if (handleApi(req, res)) return;
  const filePath = path.join(
    __dirname,
    req.url === '/' ? 'index.html' : req.url
  );
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
      res.writeHead(200, {
        'Content-Type': types[ext] || 'application/octet-stream'
      });
      res.end(data);
    }
  });
});

if (require.main === module) {
  server.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = { server, readPins };

