const http = require('http');
const fs = require('fs');
const path = require('path');

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

