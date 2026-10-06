// Vercel Serverless Function: Proxy & Parser for El Diario NY RSS feeds

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function toHttps(url) {
  if (!url) return '';
  return url.replace(/^http:\/\//i, 'https://');
}

function parseXML(xml) {
  const items = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  
  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i) || itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    
    const catMatches = [];
    const catRegex = /<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/gi;
    let cm;
    while ((cm = catRegex.exec(itemXml)) !== null) {
      if (cm[1]) catMatches.push(decodeHtml(cm[1].trim()));
    }

    let image = mediaMatch ? mediaMatch[1] : '';
    if (!image && descMatch) {
      const imgInDesc = descMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgInDesc) image = imgInDesc[1];
    }

    let cleanDesc = (descMatch ? descMatch[1] : '').replace(/<[^>]*>?/gm, '').trim();
    cleanDesc = decodeHtml(cleanDesc);
    if (cleanDesc.length > 160) cleanDesc = cleanDesc.slice(0, 157) + '...';

    const title = decodeHtml(titleMatch ? titleMatch[1].trim() : '');
    const link = linkMatch ? linkMatch[1].trim() : '';

    if (title && link) {
      items.push({
        title,
        link: toHttps(link),
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
        description: cleanDesc,
        image: toHttps(image) || 'assets/images/slide_calidad.jpg',
        categories: catMatches,
        source: 'El Diario NY'
      });
    }
  }
  return items;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const category = (req.query && req.query.category) ? req.query.category.toLowerCase() : 'all';
  
  let feedUrls = [];
  if (category === 'all' || category === 'default' || category === 'ny-politica') {
    feedUrls = [
      'https://eldiariony.com/categoria/nueva-york/feed/',
      'https://eldiariony.com/categoria/politica/feed/',
      'https://eldiariony.com/categoria/inmigracion/feed/'
    ];
  } else if (category === 'nueva-york' || category === 'ny') {
    feedUrls = ['https://eldiariony.com/categoria/nueva-york/feed/'];
  } else if (category === 'politica' || category === 'politica-inmigracion') {
    feedUrls = [
      'https://eldiariony.com/categoria/politica/feed/',
      'https://eldiariony.com/categoria/inmigracion/feed/'
    ];
  } else if (category === 'entretenimiento' || category === 'musica' || category === 'farandula') {
    feedUrls = ['https://eldiariony.com/categoria/entretenimiento/feed/'];
  } else if (category === 'inmigracion') {
    feedUrls = ['https://eldiariony.com/categoria/inmigracion/feed/'];
  } else {
    feedUrls = ['https://eldiariony.com/feed/'];
  }

  try {
    const fetchPromises = feedUrls.map(async (url) => {
      try {
        const fetchRes = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LaPuraNetaBot/1.0' },
          signal: AbortSignal.timeout(6500)
        });
        if (!fetchRes.ok) return [];
        const xml = await fetchRes.text();
        return parseXML(xml);
      } catch (err) {
        console.error(`Error fetching feed ${url}:`, err.message);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    const combinedItems = results.flat();

    // Deduplicate items by link or normalized title
    const seenLinks = new Set();
    const uniqueItems = [];

    for (const item of combinedItems) {
      if (!item.link || seenLinks.has(item.link)) continue;
      seenLinks.add(item.link);
      uniqueItems.push(item);
    }

    // Sort descending by publication date
    uniqueItems.sort((a, b) => {
      const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return timeB - timeA;
    });

    return res.status(200).json({
      status: 'ok',
      source: 'El Diario NY',
      sourceUrl: 'https://eldiariony.com/',
      category,
      total: uniqueItems.length,
      items: uniqueItems.slice(0, 24)
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      source: 'El Diario NY'
    });
  }
};
