<script setup lang="ts">
defineProps<{
  prayerName: string
}>()
</script>

<template>
  <div class="adzan-display full-screen">
    <div class="content">{{ prayerName }}</div>
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

.adzan-display {
  background-image: url('/bg-adzan.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  background-color: #122;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  color: #788;
  text-shadow: 0.3vw 0.3vw 0 rgba(0, 0, 0, 0.3);
  width: 100%;
  padding: 0 3vw;
  font-size: 10vw;
  text-align: center;
  text-transform: uppercase;
  font-family: 'OpenSansCondLight', 'Titillium Web', Arial, sans-serif;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
