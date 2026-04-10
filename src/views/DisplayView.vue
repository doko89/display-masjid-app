<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Database } from '../lib/types'
import { usePrayerTimes } from '../composables/usePrayerTimes'
import { useSchedule } from '../composables/useSchedule'

import ClockWidget from '../components/ClockWidget.vue'
import PrayerSchedule from '../components/PrayerSchedule.vue'
import InfoCarousel from '../components/InfoCarousel.vue'
import RunningText from '../components/RunningText.vue'
import WallpaperCarousel from '../components/WallpaperCarousel.vue'
import LogoDisplay from '../components/LogoDisplay.vue'
import AdzanDisplay from '../components/AdzanDisplay.vue'
import SholatDisplay from '../components/SholatDisplay.vue'
import KhutbahDisplay from '../components/KhutbahDisplay.vue'
import CountdownOverlay from '../components/CountdownOverlay.vue'

const props = defineProps<{
  db: Database
  wallpapers: string[]
  logoUrl?: string
}>()

const { prayerTimesToday, prayerTimesTomorrow, updatePrayerTimes, getPrayerMoment } = usePrayerTimes()
const { displayState, currentPrayerName, countdownTarget, countdownTitle, checkSchedule, resetToNormal } = useSchedule()

const showFullClock = ref(false)
let scheduleIntervalId: ReturnType<typeof setInterval> | null = null

const infoItems = computed(() => {
  return props.db.info.map(item => ({
    title: item[0],
    body: item[1],
    source: item[2],
    active: item[3],
  }))
})

const init = () => {
  updatePrayerTimes(props.db)

  // Check schedule every second
  scheduleIntervalId = setInterval(() => {
    checkSchedule(props.db)

    // Update prayer times at midnight
    const now = new Date()
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      updatePrayerTimes(props.db)
    }
  }, 1000)
}

const handleCountdownExpired = () => {
  resetToNormal()
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  if (scheduleIntervalId) {
    clearInterval(scheduleIntervalId)
  }
})
</script>

<template>
  <div class="display-view">
    <!-- Wallpaper Background -->
    <WallpaperCarousel
      :wallpapers="wallpapers"
      :interval="db.timer.wallpaper"
    />

    <!-- Left Sidebar - Clock and Prayer Schedule -->
    <div id="left-container">
      <ClockWidget :db="db" />
      <PrayerSchedule
        :prayer-times="prayerTimesToday"
        :db="db"
      />
    </div>

    <!-- Right Container - Info, Logo, Running Text -->
    <div id="right-container">
      <InfoCarousel
        :items="infoItems"
        :interval="db.timer.info"
      />
      <LogoDisplay :logo-url="logoUrl" />
    </div>

    <!-- Running Text -->
    <RunningText :texts="db.running_text" />

    <!-- Full Screen Clock (shown during special displays) -->
    <div id="full-screen-clock" v-if="showFullClock">
      {{ new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
    </div>

    <!-- Countdown Overlay -->
    <CountdownOverlay
      v-if="displayState === 'countdown_adzan' || displayState === 'countdown_iqomah'"
      :target-time="countdownTarget"
      :title="countdownTitle"
      :time-name="db.timeName"
      @expired="handleCountdownExpired"
    />

    <!-- Adzan Display -->
    <AdzanDisplay
      v-if="displayState === 'adzan'"
      :prayer-name="currentPrayerName"
    />

    <!-- Sholat Display -->
    <SholatDisplay v-if="displayState === 'sholat'" />

    <!-- Khutbah Display -->
    <KhutbahDisplay
      v-if="displayState === 'khutbah'"
      :text="db.jumat.text"
    />
  </div>
</template>

<style scoped>
.display-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

#left-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 26vw;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.9) 40%,
    rgba(0, 0, 0, 0.7) 100%
  );
  box-shadow: 0 0 20vw 20vw rgba(0, 0, 0, 0.7);
  padding: 15vh 0 0 0;
  z-index: 10;
}

#right-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 26vw;
  z-index: 5;
}

#full-screen-clock {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 4vw;
  color: #fff;
  padding: 1vw 5vw;
  background: rgba(0, 0, 0, 0.3);
  text-align: right;
  opacity: 0.5;
  z-index: 100;
}
</style>
