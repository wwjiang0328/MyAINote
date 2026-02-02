<template>
  <div class="timeline">
    <div v-if="items.length===0" class="status">暂无数据</div>
    <div v-for="item in items" :key="item.date + item.title" class="node">
      <div class="node-header">
        <div class="date">{{ item.date }}</div>
        <div class="title">{{ item.title }}</div>
      </div>
      <div class="desc">{{ item.desc }}</div>
      <div class="models">代表模型：<span v-for="(m,idx) in item.models" :key="m">{{ m }}<span v-if="idx < item.models.length-1"> · </span></span></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
.timeline{display:flex;flex-direction:column;gap:14px}
.node{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));padding:18px;border-radius:10px;border:1px solid rgba(255,255,255,0.03)}
.node-header{display:flex;gap:16px;align-items:center;margin-bottom:8px}
.date{background:rgba(255,255,255,0.03);padding:6px 10px;border-radius:6px;color:#9bdcff;font-weight:700}
.title{font-weight:700;color:#e9fbff}
.desc{color:#9aa6b2;margin-top:6px}
.models{color:#6ee7b7;margin-top:8px;font-size:14px}
</style>