const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_VIDEOS = [
  'nqfeDGwS2.mov', '5HXbvilF2.mov', 'c0FWtXC52.mov', 'ZIc1du0m2.mov',
  'bJvt1Xqo2.mov', '9PYhvnKk2.mov', 'TpGGZLXa1.mp4', '0U8AN5Z11.mp4',
  'eaTf1KOu1.mp4', 'mybuFyQe1.mp4', 'J2Fe1b3R1.mp4', 'UBxQd3S51.mp4',
  'LLg78ws41.mp4', 'phqv2Rb21.mp4', 'BKuXcBa91.mp4', 'B8hv1QNO2.mov',
  'l2NDdxwS2.mov', '6oZ963wl1.mp4', 'b1ic87FX1.mp4', 'CitJk9gG1.mp4'
];

// Proxy de vídeo — /v/:filename
app.get('/v/:filename', async (req, res) => {
  const filename = req.params.filename;

  if (!ALLOWED_VIDEOS.includes(filename)) {
    return res.redirect('/');
  }

  // Bloqueia acesso externo — só aceita requests vindos do próprio site
  const referer = req.headers['referer'] || '';
  const host = req.headers['host'] || '';
  const isInternal = referer.includes(host) || referer === '';

  // Em produção exige referer do próprio host
  // Em dev (localhost) deixa passar pra não travar
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  if (!isLocalhost && !referer.includes(host)) {
    return res.redirect('/');
  }

  const upstreamUrl = `https://cdn.videy.co/${filename}`;

  try {
    const upstreamHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://videy.co/',
    };

    if (req.headers['range']) {
      upstreamHeaders['Range'] = req.headers['range'];
    }

    const upstream = await fetch(upstreamUrl, { headers: upstreamHeaders });

    if (!upstream.ok && upstream.status !== 206) {
      return res.redirect('/');
    }

    const contentType = upstream.headers.get('content-type') || 'video/mp4';
    const contentLength = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    const acceptRanges = upstream.headers.get('accept-ranges');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.setHeader('Content-Disposition', 'inline; filename="video"');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

    res.status(upstream.status);
    upstream.body.pipe(res);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.redirect('/');
  }
});

// Serve thumbnails — se não existir, retorna 696.jpg como fallback
app.get('/thumbs/:name', (req, res) => {
  const thumbPath = path.join(__dirname, 'thumbs', req.params.name);
  if (fs.existsSync(thumbPath)) {
    res.sendFile(thumbPath);
  } else {
    res.sendFile(path.join(__dirname, '696.jpg'));
  }
});

// Bloqueia acesso a arquivos sensíveis
['server.js', 'package.json', 'package-lock.json'].forEach(f => {
  app.get(`/${f}`, (req, res) => res.redirect('/'));
});

// Serve arquivos estáticos
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  dotfiles: 'deny',
}));

app.listen(PORT, () => {
  console.log(`696.lol rodando na porta ${PORT}`);
});
