<template>
  <div class="app-root">
    <header class="hero">
      <div class="hero-inner">
        <h1>今日 AI 风向 🌐</h1>
        <div class="meta">
          <div class="date">{{ todayLabel }}</div>
          <div class="controls">
            <button @click="refresh" class="btn">刷新</button>
            <label class="auto">自动刷新 <input type="checkbox" v-model="auto" /></label>
          </div>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="status">{{ statusMessage }}</div>
      <TrendingList :items="items" :translating="translating" @translate-item="translateItem" />
    </main>

    <footer class="footer">数据源：Reddit / Hacker News • 仅显示中文摘要（若能自动翻译）</footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import TrendingList from './components/TrendingList.vue'

export default {
  components: { TrendingList },
  setup(){
    const items = ref([])
    const statusMessage = ref('加载中…')
    const auto = ref(true)
    const timer = ref(null)
    const translating = ref({})

    const prettyDate = (d)=> d.toLocaleString('zh-CN', { weekday: 'long', year:'numeric', month:'2-digit', day:'2-digit' })
    const todayLabel = prettyDate(new Date())

    async function fetchData(){
      statusMessage.value = '加载中…'
      try{
        const [rHn, rR1, rR2] = await Promise.all([
          fetchHN(),
          fetchReddit('MachineLearning'),
          fetchReddit('ArtificialIntelligence')
        ])

        let all = [...rHn, ...rR1, ...rR2]
        // filter keywords related to AI
        all = all.filter(it => /ai|artificial intelligence|machine learning|deep learning|llm|large language model|transformer/i.test((it.title + ' ' + (it.summary||''))))

        // dedup by title+url
        const seen = new Set()
        const dedup = []
        for(const it of all){
          const k = (it.title + '|' + (it.url||'')).toLowerCase()
          if(seen.has(k)) continue
          seen.add(k)
          dedup.push(it)
        }

        dedup.sort((a,b)=> (b.time||0) - (a.time||0))
        // Limit to top 10 and map to items with Chinese summary placeholder
        items.value = dedup.slice(0,10).map(it=>({
          id: it.id || it.title,
          time: it.time || Date.now()/1000,
          summary: summarizeOneLine(it.summary || it.title),
          orig: it,
          zh: null
        }))

        // Auto-translate each item to Chinese (falls back to original summary if no translation API configured)
        try{
          // Auto-translate items. If no API is configured, we'll use the public LibreTranslate fallback.
          const usedFallback = !import.meta.env.VITE_TRANSLATE_API
          await Promise.all(items.value.map(i=> translateItem(i)))
          statusMessage.value = `更新：${new Date().toLocaleTimeString()}（显示前10条${usedFallback? '，使用 LibreTranslate 公开接口自动翻译' : '，已尝试自动翻译'}）`
        }catch(e){
          // If translation fails, still show items
          statusMessage.value = `更新：${new Date().toLocaleTimeString()}（显示前10条，自动翻译失败）`
        }
      }catch(e){
        console.error(e)
        statusMessage.value = '加载失败：网络错误'
      }
    }

    function summarizeOneLine(s){
      const t = s.replace(/\s+/g,' ').trim()
      return t.length>200 ? t.slice(0,197) + '...' : t
    }

    async function fetchHN(){
      try{
        const url = `https://hn.algolia.com/api/v1/search?query=AI&tags=story&hitsPerPage=50`
        const res = await fetch(url)
        if(!res.ok) return []
        const j = await res.json()
        return (j.hits||[]).map(h=>({
          id: `hn_${h.objectID}`,
          title: h.title || '',
          summary: h.title || '',
          url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          source: 'HackerNews',
          score: h.points || 0,
          time: Math.floor(new Date(h.created_at).getTime()/1000)
        }))
      }catch(e){ console.warn(e); return [] }
    }

    async function fetchReddit(sub){
      try{
        const url = `https://www.reddit.com/r/${sub}/top/.json?t=day&limit=30`
        const res = await fetch(url, { headers: { 'User-Agent': 'MyAINote/1.0' } })
        if(!res.ok) return []
        const j = await res.json()
        return (j.data?.children||[]).map(c=>({
          id: `reddit_${c.data.id}`,
          title: c.data.title || '',
          summary: (c.data.selftext && c.data.selftext.trim()) ? c.data.selftext.replace(/\n+/g,' ').slice(0,300) : c.data.title,
          url: c.data.url,
          source: `r/${sub}`,
          score: c.data.score || 0,
          time: Math.floor((c.data.created_utc||0))
        }))
      }catch(e){ console.warn(e); return [] }
    }

    async function translateItem(item){
      // If already has zh, do nothing
      if(item.zh) return
      translating.value[item.id] = true
      try{
        // Use configured API if provided, otherwise fallback to public LibreTranslate
        const configured = import.meta.env.VITE_TRANSLATE_API || ''
        const api = configured || 'https://libretranslate.de/translate'

        const body = { q: item.summary, source: 'auto', target: 'zh', format: 'text' }
        const res = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        if(res.ok){
          const j = await res.json()
          // LibreTranslate returns { translatedText }
          item.zh = j.translatedText || j.result || j.translation || (j[0] && j[0].translatedText) || item.summary
          if(!configured) console.info('Using public LibreTranslate fallback for translation')
        } else {
          console.warn('Translate API returned non-OK', res.status)
          item.zh = item.summary
        }
      }catch(e){
        console.warn('Translate request failed', e)
        item.zh = item.summary
      }
      translating.value[item.id] = false
    }

    function startAuto(){
      stopAuto()
      timer.value = setInterval(()=> fetchData(), 1000*60*2)
    }
    function stopAuto(){ if(timer.value){ clearInterval(timer.value); timer.value=null } }

    function refresh(){ fetchData() }

    onMounted(()=>{
      fetchData()
      if(auto.value) startAuto()
    })
    onBeforeUnmount(()=> stopAuto())

    // watch:auto
    const stopWatchAuto = () => {
      if(auto.value) startAuto()
      else stopAuto()
    }

    return { items, statusMessage, auto, todayLabel, translateItem, refresh, translating }
  }
}
</script>

<style scoped>
/* kept empty; global styles in styles.css */
</style>