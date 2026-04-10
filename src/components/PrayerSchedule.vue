<script setup lang="ts">
import { computed } from 'vue'
import type { Database, PrayerTimes, PrayerKey } from '../lib/types'

const props = defineProps<{
  prayerTimes: PrayerTimes | null
  db: Database
  isNextDay?: boolean
}>()

const prayerKeys: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

const isActive = (key: PrayerKey): boolean => {
  if (!props.prayerTimes) return false

  const now = new Date()
  const timeStr = props.prayerTimes[key]
  if (!timeStr || timeStr === '-----') return false

  const [hours, minutes] = timeStr.split(':').map(Number)
  const prayerTime = new Date()
  prayerTime.setHours(hours, minutes, 0, 0)

  // Active from 5 minutes before until 5 minutes after
  const startWindow = new Date(prayerTime.getTime() - 5 * 60 * 1000)
  const endWindow = new Date(prayerTime.getTime() + 5 * 60 * 1000)

  return now >= startWindow && now <= endWindow
}

const getPrayerName = (key: PrayerKey): string => {
  return props.db.prayName?.[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

const getPrayerTime = (key: PrayerKey): string => {
  if (!props.prayerTimes) return '--:--'
  return props.prayerTimes[key] || '--:--'
}
</script>

<template>
  <div class="prayer-schedule">
    <div
      v-for="key in prayerKeys"
      :key="key"
      class="prayer-row"
      :class="{ active: isActive(key) }"
    >
      <span class="prayer-name">{{ getPrayerName(key) }}</span>
      <span class="prayer-time">
        {{ getPrayerTime(key) }}
        <span v-if="isNextDay && key === 'isha'" class="next-day-indicator">+</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.prayer-schedule {
  color: #33cccc;
  font-weight: bold;
}

.prayer-row {
  display: flex;
  justify-content: space-between;
  padding: 1.5vh 1.5vw;
  border-bottom: 0.7px solid rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
}

.prayer-row.active {
  background-color: rgba(51, 204, 204, 0.2);
  border-left: 0.3vw solid #e2ad00;
  border-radius: 0.5vw;
  color: #fff;
}

.prayer-name {
  font-size: 2vw;
  padding-top: 0.5vh;
  padding-left: 1.5vw;
}

.prayer-time {
  font-size: 3vw;
  text-align: right;
  padding-right: 1.8vw;
  color: #fff;
  position: relative;
}

.prayer-row.active .prayer-time {
  color: #fff;
}

.next-day-indicator {
  position: absolute;
  right: -1vw;
  top: 0.5vw;
  font-size: 1vw;
  color: #e2ad00;
  padding: 0 5px;
}
</style>
