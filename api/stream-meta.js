/**
 * Vercel Serverless Function: Stream Metadata & Multi-tier Cover Art Engine
 * Sources: Shoutcast v2 stats, Deezer API, iTunes Search API
 */

function toHttps(url) {
  if (!url) return '';
  return url.replace(/^http:\/\//i, 'https://');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=2, s-maxage=3, stale-while-revalidate=5');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SHOUTCAST_STATS_URL = 'https://radios.mipanel.stream:6952/stats?sid=1&json=1';
  const DEFAULT_COVER = 'assets/images/logo_dark_transparent.png';

  let rawData = null;
  let songtitle = '';
  let listeners = 0;
  let bitrate = '128';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const scRes = await fetch(SHOUTCAST_STATS_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LaPuraNeta/1.0'
      }
    });
    clearTimeout(timeout);

    if (scRes.ok) {
      rawData = await scRes.json();
      songtitle = (rawData.songtitle || '').trim();
      listeners = rawData.currentlisteners || 0;
      bitrate = rawData.bitrate || '128';
    }
  } catch (err) {
    console.warn('Error fetching shoutcast stats:', err.message);
  }

  // Parse artist and track title
  let artist = 'La Pura Neta Radio';
  let title = 'Transmitiendo en Vivo';
  let album = 'Pura Música de Calidad';
  let cover = DEFAULT_COVER;

  if (songtitle && songtitle.length > 0) {
    if (songtitle.includes(' - ')) {
      const parts = songtitle.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    } else {
      title = songtitle;
      artist = 'La Pura Neta';
    }

    // Multi-tier Cover Art Lookup (Deezer + iTunes)
    const coverInfo = await fetchCoverArt(artist, title);
    if (coverInfo && coverInfo.cover) {
      cover = toHttps(coverInfo.cover);
      if (coverInfo.album) album = coverInfo.album;
      if (coverInfo.artist) artist = coverInfo.artist;
      if (coverInfo.title) title = coverInfo.title;
    }
  }

  return res.status(200).json({
    success: true,
    live: true,
    station: 'La Pura Neta Radio',
    streamUrl: 'https://radios.mipanel.stream:6952/;?type=http',
    artist,
    title,
    album,
    cover: toHttps(cover),
    rawTitle: songtitle,
    listeners,
    bitrate,
    updatedAt: new Date().toISOString()
  });
};

async function fetchCoverArt(artist, title) {
  const clean = (s) => (s || '').replace(/[\(\)\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
  const cArtist = clean(artist);
  const cTitle = clean(title);

  // Strategy 1: Deezer search for 'Artist Title'
  try {
    const q = encodeURIComponent(`${cArtist} ${cTitle}`);
    const res = await fetch(`https://api.deezer.com/search?q=${q}&limit=1`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const item = data.data[0];
        const rawCover = item.album.cover_xl || item.album.cover_big || item.album.cover_medium;
        if (item.album && rawCover) {
          return {
            cover: toHttps(rawCover),
            title: item.title || cTitle,
            artist: (item.artist && item.artist.name) || cArtist,
            album: item.album.title || ''
          };
        }
      }
    }
  } catch (e) {}

  // Strategy 2: iTunes search for 'Artist Title'
  try {
    const q = encodeURIComponent(`${cArtist} ${cTitle}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        if (item.artworkUrl100) {
          return {
            cover: toHttps(item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')),
            title: item.trackName || cTitle,
            artist: item.artistName || cArtist,
            album: item.collectionName || ''
          };
        }
      }
    }
  } catch (e) {}

  // Strategy 3: Deezer search for 'Artist'
  try {
    const q = encodeURIComponent(cArtist);
    const res = await fetch(`https://api.deezer.com/search?q=${q}&limit=1`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const item = data.data[0];
        const rawCover = item.album.cover_xl || item.album.cover_big || item.album.cover_medium;
        if (item.album && rawCover) {
          return {
            cover: toHttps(rawCover),
            title: cTitle,
            artist: (item.artist && item.artist.name) || cArtist,
            album: item.album.title || ''
          };
        }
      }
    }
  } catch (e) {}

  // Strategy 4: iTunes search for 'Artist'
  try {
    const q = encodeURIComponent(cArtist);
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&media=music&limit=1`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        if (item.artworkUrl100) {
          return {
            cover: toHttps(item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')),
            title: cTitle,
            artist: item.artistName || cArtist,
            album: item.collectionName || ''
          };
        }
      }
    }
  } catch (e) {}

  return null;
}
