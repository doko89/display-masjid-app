<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  targetTime: Date | null
  title: string
  timeName?: { Hours: string; Minutes: string; Seconds: string }
}>()

const emit = defineEmits<{
  expired: []
}>()

const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
const isExpired = ref(true)

let intervalId: ReturnType<typeof setInterval> | null = null
let audioPlayed = false

const playBeep = () => {
  try {
    const audio = new Audio('/beep.mp3')
    audio.play().catch(() => {
      // Audio play failed - may need user interaction first
    })
  } catch {
    // Audio not supported
  }
}

const updateCountdown = () => {
  if (!props.targetTime) {
    isExpired.value = true
    return
  }

  const now = new Date()
  const diff = props.targetTime.getTime() - now.getTime()

  if (diff <= 0) {
    hours.value = '00'
    minutes.value = '00'
    seconds.value = '00'
    isExpired.value = true
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    emit('expired')
    return
  }

  isExpired.value = false
  audioPlayed = false

  const totalSeconds = Math.floor(diff / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  hours.value = String(h).padStart(2, '0')
  minutes.value = String(m).padStart(2, '0')
  seconds.value = String(s).padStart(2, '0')

  // Play beep at 5 seconds remaining
  if (totalSeconds <= 5 && !audioPlayed) {
    playBeep()
    audioPlayed = true
  }
}

watch(
  () => props.targetTime,
  (newTarget) => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    if (newTarget) {
      updateCountdown()
      intervalId = setInterval(updateCountdown, 1000)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="countdown-overlay full-screen" v-if="!isExpired">
    <div class="counter">
      <h1>{{ title }}</h1>
      <div class="hh">{{ hours }}<span>{{ timeName?.Hours || 'Jam' }}</span></div>
      <div class="ii">{{ minutes }}<span>{{ timeName?.Minutes || 'Menit' }}</span></div>
      <div class="ss">{{ seconds }}<span>{{ timeName?.Seconds || 'Detik' }}</span></div>
    </div>
  </div>
</template>

<style scoped>
.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

.countdown-overlay {
  background-image: url('/bg-masjid.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  background-color: #122;
}

.counter {
  color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  padding: 0 3vw;
  text-align: center;
  text-transform: uppercase;
  font-family: 'OpenSansCondLight', Arial, sans-serif;
}

.counter > h1 {
  margin: 0 auto;
  font-size: 7vh;
  line-height: 9vh;
  width: 61.5vw;
  color: #788;
  border: 0.3vh solid #788;
  border-radius: 1vh;
  font-family: 'Titillium Web', 'OpenSansCondLight', Arial, sans-serif;
  font-weight: bold;
  margin-bottom: 4vh;
}

.counter > div {
  display: inline-block;
  width: 20vw;
  font-size: 25vh;
  line-height: 30vh;
  margin: 0 0.3vw;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.75);
  padding: 0;
}

.counter > div > span {
  background: #788;
  font-size: 5vh;
  line-height: 7vh;
  font-weight: bold;
  text-shadow: none;
  color: #000;
  display: block;
  border-radius: 1vh;
}
</style>
