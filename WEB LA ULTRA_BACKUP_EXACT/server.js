const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3080;
const JAZLER_EXPORTS_DIR = process.env.JAZLER_DIR || 'C:\\Jazler SOHO\\Exports';

app.use(cors());
app.use(express.json());

const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

function parseXmlSafe(filePath) {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      return resolve(null);
    }
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      parser.parseString(content, (err, result) => {
        if (err) {
          console.error(`Error parsing XML ${filePath}:`, err.message);
          return resolve(null);
        }
        resolve(result);
      });
    } catch (e) {
      console.error(`Error reading ${filePath}:`, e.message);
      resolve(null);
    }
  });
}

// Endpoint to stream current local Jazler album art image
app.get('/api/cover', (req, res) => {
  const coverPath = path.join(JAZLER_EXPORTS_DIR, 'CurrentAlbumImage.jpg');
  if (fs.existsSync(coverPath)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Content-Type', 'image/jpeg');
    return res.sendFile(coverPath);
  }
  return res.redirect('/assets/images/logo-ultra.png');
});

// Endpoint for complete live Jazler metadata
app.get('/api/live', async (req, res) => {
  try {
    const nowOnAirPath = path.join(JAZLER_EXPORTS_DIR, 'NowOnAir.xml');
    const airPlayNextPath = path.join(JAZLER_EXPORTS_DIR, 'AirPlayNext.xml');
    const airPlayHistoryPath = path.join(JAZLER_EXPORTS_DIR, 'AirPlayHistory.xml');
    const nowTxtPath = path.join(JAZLER_EXPORTS_DIR, 'NowOnAir.txt');
    const coverPath = path.join(JAZLER_EXPORTS_DIR, 'CurrentAlbumImage.jpg');

    let hasLocalCover = fs.existsSync(coverPath);
    let coverMtime = hasLocalCover ? fs.statSync(coverPath).mtimeMs : 0;

    let nowXml = await parseXmlSafe(nowOnAirPath);
    let nextXml = await parseXmlSafe(airPlayNextPath);
    let historyXml = await parseXmlSafe(airPlayHistoryPath);

    // Fallback if NowOnAir.xml is missing
    let rawTxt = '';
    if (fs.existsSync(nowTxtPath)) {
      rawTxt = fs.readFileSync(nowTxtPath, 'utf8').trim();
    }

    let nowPlaying = {
      title: 'Música en Vivo',
      artist: 'LA ULTRA RADIO ONLINE',
      display: 'LA ULTRA - Hay niveles de niveles',
      startTime: '',
      runTime: '',
      expireTime: '',
      cover: hasLocalCover ? `/api/cover?t=${coverMtime}` : '/assets/images/logo-ultra.png',
      hasLocalCover: hasLocalCover
    };

    if (nowXml && nowXml.Schedule && nowXml.Schedule.Event) {
      const evt = nowXml.Schedule.Event;
      const song = evt.Song || {};
      const artistObj = song.Artist || {};
      const mediaObj = song.Media || {};
      const expireObj = song.Expire || {};
      const announcement = evt.Announcement || {};

      nowPlaying.title = song.title || (rawTxt ? rawTxt.split(' - ')[1] : 'Música en Vivo') || 'Música en Vivo';
      nowPlaying.artist = (typeof artistObj === 'object' ? artistObj.name : artistObj) || (rawTxt ? rawTxt.split(' - ')[0] : 'LA ULTRA') || 'LA ULTRA';
      nowPlaying.startTime = evt.startTime || '';
      nowPlaying.runTime = mediaObj.runTime || '';
      nowPlaying.expireTime = expireObj.Time || '';
      nowPlaying.display = (announcement.Display || `${nowPlaying.artist} - ${nowPlaying.title}`).trim();
    } else if (rawTxt) {
      if (rawTxt.includes(' - ')) {
        const parts = rawTxt.split(' - ');
        nowPlaying.artist = parts[0].trim();
        nowPlaying.title = parts.slice(1).join(' - ').trim();
        nowPlaying.display = rawTxt;
      } else {
        nowPlaying.title = rawTxt;
        nowPlaying.display = rawTxt;
      }
    }

    // Process Up Next songs
    let nextSongs = [];
    if (nextXml && nextXml.Event && nextXml.Event.Song) {
      const rawSongs = Array.isArray(nextXml.Event.Song) ? nextXml.Event.Song : [nextXml.Event.Song];
      nextSongs = rawSongs.map(s => {
        const art = typeof s.Artist === 'object' ? s.Artist.name : s.Artist;
        const inf = s.Info || {};
        const med = s.Media || {};
        const ann = s.Announcement || {};
        return {
          title: s.title || 'Canción Próxima',
          artist: art || 'Artista',
          startTime: inf.StartTime || '',
          runTime: med.runTime || '',
          display: ann.Display || `${art} - ${s.title}`
        };
      });
    }

    // Process History songs
    let history = [];
    if (historyXml && historyXml.Event && historyXml.Event.Song) {
      const rawHistory = Array.isArray(historyXml.Event.Song) ? historyXml.Event.Song : [historyXml.Event.Song];
      history = rawHistory.map(s => {
        const art = typeof s.Artist === 'object' ? s.Artist.name : s.Artist;
        const inf = s.Info || {};
        const med = s.Media || {};
        const ann = s.Announcement || {};
        return {
          title: s.title || 'Canción Anterior',
          artist: art || 'Artista',
          startTime: inf.StartTime || '',
          runTime: med.runTime || '',
          display: ann.Display || `${art} - ${s.title}`
        };
      });
    }

    res.json({
      success: true,
      source: 'jazler_soho_local',
      nowPlaying,
      nextSongs,
      history,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error serving /api/live:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static frontend files after API routes
app.use(express.static(path.join(__dirname)));

// Fallback route to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server when executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 LA ULTRA RADIO ONLINE - Servidor Web & API Activo`);
    console.log(`📡 URL Local: http://localhost:${PORT}`);
    console.log(`📂 Jazler Exports: ${JAZLER_EXPORTS_DIR}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
