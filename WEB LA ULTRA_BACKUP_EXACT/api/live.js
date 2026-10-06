export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Shoutcast / Icecast stream stats URL
    const streamStatsUrl = 'https://radios.mipanel.stream:6952/stats?sid=1&json=1';
    let rawTitle = '';
    let isLive = true;

    try {
      const response = await fetch(streamStatsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        rawTitle = (data.songtitle || '').trim();
      }
    } catch (fetchErr) {
      console.warn('Direct stream stats fetch error:', fetchErr.message);
    }

    let artist = 'LA ULTRA';
    let title = 'Radio Online - Hay niveles de niveles';

    if (rawTitle) {
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      } else {
        title = rawTitle;
      }
    }

    // Attempt to search high-resolution cover art on iTunes API
    let cover = '/assets/images/logo-ultra.png';
    let album = 'LA ULTRA';

    if (rawTitle && artist !== 'LA ULTRA') {
      try {
        const cleanQuery = encodeURIComponent(`${artist} ${title}`.replace(/[\(\)\[\]]/g, ' ').trim());
        const itunesRes = await fetch(`https://itunes.apple.com/search?term=${cleanQuery}&entity=song&limit=1`, {
          signal: AbortSignal.timeout(2500)
        });
        if (itunesRes.ok) {
          const itunesData = await itunesRes.json();
          if (itunesData.results && itunesData.results.length > 0) {
            const track = itunesData.results[0];
            cover = track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb.jpg', '1000x1000bb.jpg') : cover;
            album = track.collectionName || album;
          }
        }
      } catch (itunesErr) {
        console.warn('iTunes cover art search error:', itunesErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      source: 'vercel_cloud_proxy',
      nowPlaying: {
        title: title,
        artist: artist,
        album: album,
        display: rawTitle || `${artist} - ${title}`,
        cover: cover,
        hasLocalCover: false
      },
      nextSongs: [],
      history: [],
      timestamp: Date.now()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      nowPlaying: {
        title: 'Hay niveles de niveles',
        artist: 'LA ULTRA RADIO ONLINE',
        cover: '/assets/images/logo-ultra.png'
      }
    });
  }
}
