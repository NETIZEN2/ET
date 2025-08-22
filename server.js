const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const hashedPassword = crypto.createHash('sha256').update('eurotrip').digest('hex');
const sessions = new Set();

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

module.exports = { server, sessions };
