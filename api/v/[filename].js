const https = require('https');

const ALLOWED_VIDEOS = [
  'nqfeDGwS2.mov', '5HXbvilF2.mov', 'c0FWtXC52.mov', 'ZIc1du0m2.mov',
  'bJvt1Xqo2.mov', '9PYhvnKk2.mov', 'TpGGZLXa1.mp4', '0U8AN5Z11.mp4',
  'eaTf1KOu1.mp4', 'mybuFyQe1.mp4', 'J2Fe1b3R1.mp4', 'UBxQd3S51.mp4',
  'LLg78ws41.mp4', 'phqv2Rb21.mp4', 'BKuXcBa91.mp4', 'B8hv1QNO2.mov',
  'l2NDdxwS2.mov', '6oZ963wl1.mp4', 'b1ic87FX1.mp4', 'CitJk9gG1.mp4'
];

function fetchWithRedirects(url, headers, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 10) return reject(new Error('Too many redirects'));
    const req = https.request(url, { headers }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        return fetchWithRedirects(res.headers.location, headers, redirects + 1)
          .then(resolve).catch(reject);
      }
      resolve(res);
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = async (req, res) => {
  const { filename } = req.query;

  if (!ALLOWED_VIDEOS.includes(filename)) {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  // Bloqueia acesso externo — só aceita requests do próprio site
  const referer = req.headers['referer'] || '';
  const host = req.headers['host'] || '';
  if (referer && !referer.includes(host)) {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  const upstreamUrl = `https://cdn.videy.co/${filename}`;
  const upstreamHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://videy.co/',
  };

  if (req.headers['range']) {
    upstreamHeaders['Range'] = req.headers['range'];
  }

  try {
    const upstream = await fetchWithRedirects(upstreamUrl, upstreamHeaders);

    res.writeHead(upstream.statusCode, {
      'Content-Type': upstream.headers['content-type'] || 'video/mp4',
      'Cache-Control': 'no-store, no-cache',
      'Content-Disposition': 'inline; filename="video"',
      'X-Content-Type-Options': 'nosniff',
      ...(upstream.headers['content-length'] && { 'Content-Length': upstream.headers['content-length'] }),
      ...(upstream.headers['content-range'] && { 'Content-Range': upstream.headers['content-range'] }),
      ...(upstream.headers['accept-ranges'] && { 'Accept-Ranges': upstream.headers['accept-ranges'] }),
    });

    upstream.pipe(res);
  } catch (err) {
    res.writeHead(302, { Location: '/' });
    res.end();
  }
};
