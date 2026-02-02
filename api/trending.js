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
    const res = await fetch(url, { headers: {'User-Agent': 'MyAINote/1.0'} });
    if(!res.ok) return [];
    const j = await res.json();
    return (j.data?.children||[]).map(c=>{
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
  }catch(e){
    console.error('fetchReddit error', e);
    return [];
  }
}

async function fetchHackerNews(startTs, limit=30){
  try{
    const url = `https://hn.algolia.com/api/v1/search?query=AI&tags=story&numericFilters=created_at_i>${startTs}&hitsPerPage=${limit}`;
    const res = await fetch(url);
    if(!res.ok) return [];
    const data = await res.json();
    return data.hits.map(h=>({
      id: `hn_${h.objectID}`,
      title: h.title || '',
      summary: (h.title || '').slice(0,300),
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      source: 'HackerNews',
      score: h.points || h.num_comments || 0,
      time: Math.floor(new Date(h.created_at).getTime()/1000)
    }));
  }catch(e){
    console.error('fetchHackerNews error', e);
    return [];
  }
}

export default async function handler(req, res){
  try{
    const startTs = START_OF_DAY();
    const [r1,r2,r3, hn] = await Promise.all([
      fetchReddit('MachineLearning', 10),
      fetchReddit('ArtificialIntelligence', 10),
      fetchReddit('MachineLearningProjects', 6),
      fetchHackerNews(startTs, 30)
    ]);

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

    // Cache on CDN for 5 minutes, stale while revalidate for 10 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(result);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'fetch_failed', message: err.message });
  }
}
