const path = require('path');
const fs = require('fs');

// 1x1 pixel preto
const BLACK_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

module.exports = (req, res) => {
  const { name } = req.query;
  if (!name || !name.match(/^[a-zA-Z0-9_-]+\.jpg$/)) {
    res.setHeader('Content-Type', 'image/png');
    return res.end(BLACK_PIXEL);
  }

  const thumbPath = path.join(process.cwd(), 'thumbs', name);
  if (fs.existsSync(thumbPath)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    return res.end(fs.readFileSync(thumbPath));
  }

  res.setHeader('Content-Type', 'image/png');
  res.end(BLACK_PIXEL);
};
