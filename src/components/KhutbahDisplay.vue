<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div class="khutbah-display full-screen">
    <div class="content">{{ text }}</div>
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

.khutbah-display {
  background-image: url('/bg-kubah.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  background-color: #122;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #788;
  text-shadow: 0.3vw 0.3vw 0 rgba(0, 0, 0, 0.3);
  width: 100%;
  padding: 0 3vw;
  font-size: 6vw;
  text-align: center;
  font-family: 'OpenSansCondLight', 'Titillium Web', Arial, sans-serif;
  text-transform: uppercase;
}
</style>
