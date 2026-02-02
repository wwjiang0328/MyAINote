<template>
  <div class="app-root">
    <header class="hero">
      <div class="hero-inner">
        <h1>今日 AI 风向 🌐</h1>
        <div class="meta">
          <div class="date">{{ todayLabel }}</div>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="status">{{ statusMessage }}</div>
      <TimelineList :items="timeline" />
    </main>

    <footer class="footer">数据说明：静态整理，中文展示</footer>
  </div>
</template>

<script>
import { ref } from 'vue'
import TimelineList from './components/TimelineList.vue'

export default {
  components: { TimelineList },
  setup(){
    // 静态中文时间线（按时间倒序）
    const timeline = ref([
      {
        date: '2024',
        title: '大规模多模态与高效推理',
        desc: '多模态能力与推理效率成为主流，研究与产业双向推进，生成式应用日益丰富。',
        models: ['GPT-4（系列）', 'Claude（系列）', 'PaLM 2', 'LLaMA 2']
      },
      {
        date: '2022–2023',
        title: '大语言模型（LLM）爆发',
        desc: '以对话接口和生成能力为代表的 LLM 进入大众视野，推动了大量应用落地。',
        models: ['ChatGPT（GPT-3.5 / GPT-4）', 'Bard', 'LLaMA']
      },
      {
        date: '2018',
        title: '预训练-微调范式普及',
        desc: 'BERT 等预训练模型广泛用于下游任务，预训练成为 NLP 的标准流程。',
        models: ['BERT', 'RoBERTa']
      },
      {
        date: '2017',
        title: 'Transformer 架构提出',
        desc: '自注意力机制改变了序列建模方式，为后续大模型奠定基础。',
        models: ['Transformer']
      },
      {
        date: '2012',
        title: '深度学习在图像识别上突破',
        desc: 'AlexNet 在图像识别竞赛中取得决定性进展，深度学习研究和工程进入快速发展期。',
        models: ['AlexNet']
      }
    ])

    const statusMessage = ref('静态展示：AI 历史进展（按时间倒序，中文）')


    const prettyDate = (d)=> d.toLocaleString('zh-CN', { weekday: 'long', year:'numeric', month:'2-digit', day:'2-digit' })
    const todayLabel = prettyDate(new Date())

    // 本页面为静态中文时间线，无网络抓取或翻译逻辑。时间线数据保存在 `timeline` 变量中。

    return { timeline, statusMessage, todayLabel }
  }
}
</script>

<style scoped>
/* kept empty; global styles in styles.css */
</style>