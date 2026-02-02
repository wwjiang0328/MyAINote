const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

function startOfDayTimestamp() {
  const d = new Date();
  d.setHours(0,0,0,0);
  return Math.floor(d.getTime()/1000);
}

async function fetchReddit(subreddit, limit=10) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/top/.json?t=day&limit=${limit}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'MyAINote/1.0' } });
    if(!res.ok) return [];
    const data = await res.json();
    return data.data.children.map(c=>{
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
  } catch(err) {
    console.error('reddit fetch error', err);
    return [];
  }
}

async function fetchHackerNews(startTs, limit=30) {
  try {
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
  } catch(err) {
    console.error('hn fetch error', err);
    return [];
  }
}

app.get('/api/trending', async (req,res) => {
  try {
    const startTs = startOfDayTimestamp();
    const [r1,r2,r3,hn] = await Promise.all([
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
    res.json({date: (new Date()).toISOString(), items: dedup.slice(0, 20)});
  } catch(err){
    console.error(err);
    res.status(500).json({error:'fetch_failed', message: err.message});
  }
});

app.listen(PORT, ()=> console.log(`Server running at http://localhost:${PORT}`));
