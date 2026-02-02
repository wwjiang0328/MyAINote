// Vercel Serverless Function: /api/trending
// Reuses logic from server.js but as a serverless handler

const START_OF_DAY = () => {
  const d = new Date();
  d.setHours(0,0,0,0);
  return Math.floor(d.getTime()/1000);
};

async function fetchReddit(subreddit, limit=10){
  try{
    const url = `https://www.reddit.com/r/${subreddit}/top/.json?t=day&limit=${limit}`;
    const res = await fetch(url, { headers: {'User-Agent': 'MyAINote/1.0'}, timeout: 8000 });
    if(!res.ok) {
      console.warn(`[reddit] ${subreddit}: HTTP ${res.status}`);
      return [];
    }
    const j = await res.json();
    const items = (j.data?.children||[]).map(c=>{
      const p = c.data;
      return {
        id: `reddit_${p.id}`,
        title: p.title,
        summary: (p.selftext && p.selftext.trim()) ? p.selftext.replace(/\n+/g,' ').slice(0,300) : p.title.slice(0,200),
        url: p.url,
        source: `r/${subreddit}`,
        score: p.score || p.ups || 0,
        time: p.created_utc
      };
    });
    console.log(`[reddit] ${subreddit}: fetched ${items.length} items`);
    return items;
  }catch(e){
    console.error(`[reddit] ${subreddit} error:`, e.message);
    return [];
  }
}

async function fetchHackerNews(startTs, limit=30){
  try{
    const url = `https://hn.algolia.com/api/v1/search?query=AI&tags=story&numericFilters=created_at_i>${startTs}&hitsPerPage=${limit}`;
    const res = await fetch(url, { timeout: 8000 });
    if(!res.ok) {
      console.warn(`[hn] HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    const items = (data.hits || []).map(h=>({
      id: `hn_${h.objectID}`,
      title: h.title || '',
      summary: (h.title || '').slice(0,300),
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      source: 'HackerNews',
      score: h.points || h.num_comments || 0,
      time: Math.floor(new Date(h.created_at).getTime()/1000)
    }));
    console.log(`[hn] fetched ${items.length} items`);
    return items;
  }catch(e){
    console.error('[hn] error:', e.message);
    return [];
  }
}

export default async function handler(req, res){
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if(req.method === 'OPTIONS'){
    res.status(200).end();
    return;
  }

  try{
    console.log('[trending] Starting fetch at', new Date().toISOString());
    const startTs = START_OF_DAY();
    
    const [r1,r2,r3, hn] = await Promise.all([
      fetchReddit('MachineLearning', 10),
      fetchReddit('ArtificialIntelligence', 10),
      fetchReddit('MachineLearningProjects', 6),
      fetchHackerNews(startTs, 30)
    ]);

    console.log(`[trending] Fetched: Reddit=${r1.length}+${r2.length}+${r3.length}, HN=${hn.length}`);

    let items = [...r1, ...r2, ...r3, ...hn];
    items = items.filter(it => /(ai|artificial intelligence|machine learning|deep learning|llm)/i.test((it.title + ' ' + it.summary)));

    const seen = new Set();
    const dedup = [];
    for(const it of items){
      if(seen.has(it.url)) continue;
      seen.add(it.url);
      dedup.push(it);
    }
    dedup.sort((a,b)=>b.score - a.score);
    const result = { date: (new Date()).toISOString(), items: dedup.slice(0, 20) };

    console.log(`[trending] Returning ${result.items.length} items`);

    // Cache on CDN for 5 minutes, stale while revalidate for 10 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  }catch(err){
    console.error('[trending] Error:', err.message, err.stack);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'fetch_failed', message: err.message, details: err.toString() });
  }
}
