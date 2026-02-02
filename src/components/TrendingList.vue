<template>
  <div class="list">
    <div v-if="items.length===0" class="status">暂无数据</div>
    <div v-for="item in items" :key="item.id" class="item">
      <div class="row">
        <div class="title">{{ item.zh || item.summary }}</div>
        <div class="meta-right">{{ formatTime(item.time) }}</div>
      </div>
      <div class="sub">来源：{{ item.orig?.source || '未知' }}</div>
      <div class="actions">
        <button v-if="!item.zh" class="small" @click="$emit('translate-item', item)" :disabled="translating[item.id]">翻译为中文</button>
        <span v-else class="translated">已翻译</span>
        <span v-if="translating[item.id]">翻译中…</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: { type: Array, default: ()=>[] },
    translating: { type: Object, default: ()=>({}) }
  },
  methods: {
    formatTime(ts){
      try{
        const d = new Date((ts||0) * 1000)
        return d.toLocaleString('zh-CN', { hour:'2-digit', minute:'2-digit' })
      }catch(e){ return '' }
    }
  }
}
</script>

<style scoped>
.list{display:flex;flex-direction:column;gap:12px}
.item{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,0.03)}
.row{display:flex;justify-content:space-between;align-items:center}
.title{font-weight:700;color:#e9fbff}
.meta-right{color:#9aa6b2;font-size:13px}
.sub{color:#9aa6b2;margin-top:8px}
.actions{margin-top:8px}
.small{background:transparent;border:1px solid rgba(255,255,255,0.06);color:#00f6ff;padding:6px 8px;border-radius:8px;cursor:pointer}

.translated{color:#6ee7b7;margin-left:8px;font-size:13px}
</style>