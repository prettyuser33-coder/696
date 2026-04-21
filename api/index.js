const path = require('path');
const fs = require('fs');

// Na Vercel, os arquivos ficam um nível acima da pasta api/
const ROOT = path.join(__dirname, '..');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

module.exports = (req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];

  // Bloqueia acesso a arquivos sensíveis
  const blocked = ['server.js', 'package.json', 'package-lock.json', 'generate-thumbs.js', 'vercel.json'];
  const basename = path.basename(filePath);
  if (blocked.includes(basename)) {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  const fullPath = path.join(ROOT, filePath);

  // Garante que não sai do ROOT (path traversal)
  if (!fullPath.startsWith(ROOT)) {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
    const ext = path.extname(fullPath);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.end(fs.readFileSync(fullPath));
  }

  // Fallback pro index.html
  const indexPath = path.join(ROOT, 'index.html');
  res.setHeader('Content-Type', 'text/html');
  res.end(fs.readFileSync(indexPath));
};
