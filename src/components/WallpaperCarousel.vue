<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  wallpapers: string[]
  interval?: number
}>()

const currentIndex = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

const currentWallpaper = computed(() => {
  if (props.wallpapers.length === 0) return null
  return props.wallpapers[currentIndex.value % props.wallpapers.length]
})

const next = () => {
  if (props.wallpapers.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % props.wallpapers.length
  }
}

onMounted(() => {
  if (props.interval && props.interval > 0 && props.wallpapers.length > 1) {
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
  <div class="wallpaper-carousel">
    <div
      v-if="currentWallpaper"
      class="slide active"
      :style="{ backgroundImage: `url(${currentWallpaper})` }"
    ></div>
    <div class="overlay"></div>
  </div>
</template>

<style scoped>
.wallpaper-carousel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  height: 100vh;
}

.slide.active {
  animation: fadeSlide 2s ease-in-out;
}

@keyframes fadeSlide {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: #080d15;
  opacity: 0.7;
}
</style>
