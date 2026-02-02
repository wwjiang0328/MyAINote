<template>
  <div class="timeline-container" ref="timeline">
    <div class="timeline-line"></div>
    <div
      v-for="(item, index) in timelineData"
      :key="index"
      class="timeline-item"
      :class="[
        `timeline-item-${index % 2 === 0 ? 'left' : 'right'}`,
        { 'is-visible': visibleItems.includes(index) }
      ]"
      :ref="el => setItemRef(el, index)"
    >
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-year">{{ item.year }}</div>
        <h3 class="timeline-title">{{ item.title }}</h3>
        <p class="timeline-description">{{ item.description }}</p>
        <div class="timeline-keywords">
          <span v-for="keyword in item.keywords" :key="keyword" class="keyword-tag">
            {{ keyword }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { timelineData } from '../ai-history.js';

const timeline = ref(null);
const itemRefs = ref([]);
const visibleItems = ref([]);
let observer;

const setItemRef = (el, index) => {
  if (el) {
    itemRefs.value[index] = el;
  }
};

onMounted(() => {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = itemRefs.value.indexOf(entry.target);
        if (index !== -1 && !visibleItems.value.includes(index)) {
          visibleItems.value.push(index);
        }
      }
    });
  }, options);

  itemRefs.value.forEach(item => {
    if (item) {
      observer.observe(item);
    }
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.timeline-container {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--timeline-line);
  transform: translateX(-50%);
  box-shadow: 0 0 10px var(--primary-glow);
}

.timeline-item {
  position: relative;
  width: 50%;
  padding: 20px 40px;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.timeline-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.timeline-item-left {
  left: 0;
  padding-right: 60px;
  text-align: right;
}

.timeline-item-right {
  left: 50%;
  padding-left: 60px;
  text-align: left;
}

.timeline-dot {
  content: '';
  position: absolute;
  top: 30px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: var(--secondary-glow);
  border: 3px solid var(--primary-glow);
  box-shadow: 0 0 15px var(--secondary-glow);
  z-index: 1;
}

.timeline-item-left .timeline-dot {
  right: -7.5px;
}

.timeline-item-right .timeline-dot {
  left: -7.5px;
}

.timeline-content {
  padding: 20px;
  background: var(--card-bg);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  position: relative;
}

.timeline-year {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-glow);
  margin-bottom: 10px;
  text-shadow: 0 0 5px var(--primary-glow);
}

.timeline-title {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 10px;
  color: var(--text-primary);
  text-shadow: none; /* Override global heading shadow */
}

.timeline-description {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 15px;
}

.timeline-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.timeline-item-left .timeline-keywords {
  justify-content: flex-end;
}

.keyword-tag {
  background-color: rgba(0, 178, 255, 0.1);
  color: var(--secondary-glow);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 400;
  border: 1px solid rgba(0, 178, 255, 0.2);
  transition: all 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .timeline-line {
    left: 20px;
  }
  .timeline-item {
    width: 100%;
    padding-left: 70px;
    padding-right: 20px;
    text-align: left;
  }
  .timeline-item-left,
  .timeline-item-right {
    left: 0;
    padding-left: 70px;
    padding-right: 20px;
    text-align: left;
  }
  .timeline-dot {
    left: 12.5px;
  }
  .timeline-item-left .timeline-dot,
  .timeline-item-right .timeline-dot {
    left: 12.5px;
  }
  .timeline-item-left .timeline-keywords {
    justify-content: flex-start;
  }
}
</style>
