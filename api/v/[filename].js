const https = require('https');

const ALLOWED_VIDEOS = [
  'nqfeDGwS2.mov', '5HXbvilF2.mov', 'c0FWtXC52.mov', 'ZIc1du0m2.mov',
  'bJvt1Xqo2.mov', '9PYhvnKk2.mov', 'TpGGZLXa1.mp4', '0U8AN5Z11.mp4',
  'eaTf1KOu1.mp4', 'mybuFyQe1.mp4', 'J2Fe1b3R1.mp4', 'UBxQd3S51.mp4',
  'LLg78ws41.mp4', 'phqv2Rb21.mp4', 'BKuXcBa91.mp4', 'B8hv1QNO2.mov',
  'l2NDdxwS2.mov', '6oZ963wl1.mp4', 'b1ic87FX1.mp4', 'CitJk9gG1.mp4'
];

function fetchWithRedirects(url, reqHeaders, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 10) return reject(new Error('Too many redirects'));
    const req = https.request(url, { headers: reqHeaders }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        return fetchWithRedirects(res.headers.location, reqHeaders, redirects + 1)
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

  if (!filename || !ALLOWED_VIDEOS.includes(filename)) {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  // Bloqueia acesso externo
  const referer = req.headers['referer'] || '';
  const host = req.headers['host'] || '';
  if (referer && !referer.includes(host)) {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  const upstreamHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://videy.co/',
    'Accept': '*/*',
  };

  if (req.headers['range']) {
    upstreamHeaders['Range'] = req.headers['range'];
  }

  try {
    const upstream = await fetchWithRedirects(
      `https://cdn.videy.co/${filename}`,
      upstreamHeaders
    );

    const responseHeaders = {
      'Content-Type': upstream.headers['content-type'] || 'video/mp4',
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
    };

    if (upstream.headers['content-length'])
      responseHeaders['Content-Length'] = upstream.headers['content-length'];
    if (upstream.headers['content-range'])
      responseHeaders['Content-Range'] = upstream.headers['content-range'];
    if (upstream.headers['accept-ranges'])
      responseHeaders['Accept-Ranges'] = upstream.headers['accept-ranges'];

    res.writeHead(upstream.statusCode, responseHeaders);
    upstream.pipe(res);

    req.on('close', () => upstream.destroy());
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(302, { Location: '/' });
      res.end();
    }
  }
};
