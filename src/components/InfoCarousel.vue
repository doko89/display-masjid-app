<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface InfoItem {
  title: string
  body: string
  source: string
  active: boolean
}

const props = defineProps<{
  items: InfoItem[]
  interval?: number
}>()

const currentIndex = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

const activeItems = computed(() => {
  return props.items.filter(item => item.active)
})

const currentItem = computed(() => {
  if (activeItems.value.length === 0) return null
  return activeItems.value[currentIndex.value % activeItems.value.length]
})

const next = () => {
  if (activeItems.value.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % activeItems.value.length
  }
}

onMounted(() => {
  if (props.interval && props.interval > 0) {
    intervalId = setInterval(next, props.interval * 1000)
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="info-carousel" v-if="currentItem">
    <div class="hero">
      <hgroup>
        <div class="text1">{{ currentItem.title }}</div>
        <div class="text2">{{ currentItem.body }}</div>
        <div class="text3">{{ currentItem.source }}</div>
      </hgroup>
    </div>
  </div>
</template>

<style scoped>
.info-carousel {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  padding: 0 3vw;
  text-align: right;
  color: #fff;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.75);
  font-family: 'OpenSansCondLight', 'Titillium Web', Arial, sans-serif;
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.text1 {
  text-transform: uppercase;
  font-size: 3.3vw;
  color: #33cccc;
  margin-bottom: 1vh;
}

.text2 {
  font-size: 2.9vw;
  font-style: italic;
  line-height: 1.3;
}

.text3 {
  margin-top: 3vh;
  font-size: 1.5vw;
  font-style: italic;
  position: relative;
}

.text3::before {
  content: '';
  position: absolute;
  height: 1vw;
  width: 10vw;
  top: -1vw;
  right: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10'%3E%3Cline x1='0' y1='5' x2='100' y2='5' stroke='%23e2ad00' stroke-width='2'/%3E%3C/svg%3E");
  background-size: contain;
  background-position: right center;
  background-repeat: no-repeat;
}
</style>
