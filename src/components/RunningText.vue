<script setup lang="ts">
defineProps<{
  texts: string[]
}>()
</script>

<template>
  <div class="running-text">
    <div class="marker"></div>
    <div class="text-container">
      <div class="text">
        <template v-for="(text, index) in texts" :key="index">
          <i class="fa fa-square-o" aria-hidden="true"></i> {{ text }}
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.running-text {
  height: 3.5vw;
  width: 70vw;
  color: #fff;
  background-color: rgba(51, 204, 204, 0.2);
  position: fixed;
  bottom: 2vh;
  right: 2vw;
  border-radius: 5px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.marker {
  position: absolute;
  height: 100%;
  width: 5vw;
  background-color: #e2ad00;
  border-radius: 5px 0 0 5px;
  z-index: 1;
}

.text-container {
  position: absolute;
  left: 5.5vw;
  right: 0.5vw;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.text {
  white-space: nowrap;
  font-size: 2.1vw;
  font-family: 'Titillium Web', 'OpenSansCondLight', Arial, sans-serif;
  padding-top: 0.3vw;
  animation: marquee 30s linear infinite;
}

.text i {
  color: #e2ad00;
  margin-left: 20px;
  margin-right: 7px;
  font-size: 2vw;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
