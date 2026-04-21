const ALLOWED_VIDEOS = [
  'nqfeDGwS2.mov', '5HXbvilF2.mov', 'c0FWtXC52.mov', 'ZIc1du0m2.mov',
  'bJvt1Xqo2.mov', '9PYhvnKk2.mov', 'TpGGZLXa1.mp4', '0U8AN5Z11.mp4',
  'eaTf1KOu1.mp4', 'mybuFyQe1.mp4', 'J2Fe1b3R1.mp4', 'UBxQd3S51.mp4',
  'LLg78ws41.mp4', 'phqv2Rb21.mp4', 'BKuXcBa91.mp4', 'B8hv1QNO2.mov',
  'l2NDdxwS2.mov', '6oZ963wl1.mp4', 'b1ic87FX1.mp4', 'CitJk9gG1.mp4'
];

module.exports = (req, res) => {
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

  // Redireciona direto — zero latência extra
  res.writeHead(302, {
    'Location': `https://cdn.videy.co/${filename}`,
    'Cache-Control': 'no-store',
  });
  res.end();
};
