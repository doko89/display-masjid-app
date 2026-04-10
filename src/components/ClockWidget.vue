<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Database } from '../lib/types'

const props = defineProps<{
  db: Database
}>()

const currentTime = ref('')
const currentDate = ref('')

let intervalId: ReturnType<typeof setInterval> | null = null

const updateClock = () => {
  const now = new Date()

  // Format time as HH.mm with seconds below
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}.${minutes}<div>${seconds}</div>`

  // Format date in Indonesian
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const dayName = props.db.dayName?.[days[now.getDay()]] || days[now.getDay()]
  const monthName = props.db.monthName?.[months[now.getMonth()]] || months[now.getMonth()]

  currentDate.value = `${dayName}, ${now.getDate()} ${monthName} ${now.getFullYear()}`
}

onMounted(() => {
  updateClock()
  intervalId = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="clock-widget">
    <div class="time" v-html="currentTime"></div>
    <div class="date">{{ currentDate }}</div>
  </div>
</template>

<style scoped>
.clock-widget {
  text-align: center;
  margin-bottom: 2vh;
}

.time {
  font-size: 6vw;
  font-weight: bold;
  color: #fff;
  line-height: 0.9;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.time :deep(div) {
  font-size: 3vw;
  color: #33cccc;
  line-height: 0.8;
  margin-top: 0.2vw;
  padding-left: 0.5vw;
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  display: inline-block;
}

.date {
  font-size: 2vw;
  color: #fff;
  margin-top: 0.8vh;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
