import anime from 'animejs/lib/anime.es.js';
const anime = require('animejs/lib/anime.min.js');

const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for URL mappings
const urlDatabase = {};

// Generate a short ID for the URL
function generateShortId() {
  return crypto.randomBytes(4).toString('hex');
}

// Endpoint to create a short URL
app.post('/shorten', (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Check if URL already exists in database
  for (const shortId in urlDatabase) {
    if (urlDatabase[shortId] === originalUrl) {
      return res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${shortId}` });
    }
  }

  const shortId = generateShortId();
  urlDatabase[shortId] = originalUrl;

  res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${shortId}` });
});

// Endpoint to redirect short URL to original URL
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlDatabase[shortId];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.status(404).json({ error: 'Short URL not found' });
  }
});

app.listen(PORT, () => {
  console.log(`URL Shortener backend running on port ${PORT}`);
});
