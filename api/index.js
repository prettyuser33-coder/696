const path = require('path');
const fs = require('fs');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.ttf': 'font/ttf',
};

module.exports = (req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  // remove query string
  filePath = filePath.split('?')[0];

  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    const indexPath = path.join(process.cwd(), 'index.html');
    res.setHeader('Content-Type', 'text/html');
    return res.end(fs.readFileSync(indexPath));
  }

  const ext = path.extname(fullPath);
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.end(fs.readFileSync(fullPath));
};
