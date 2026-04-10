<script setup lang="ts">
</script>

<template>
  <div class="sholat-display full-screen">
    <div class="content">
      <i class="fa fa-clock-o"></i>&nbsp;&nbsp;
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

.sholat-display {
  background-image: url('/bg-sholat.png');
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
  font-size: 4vw;
  text-transform: uppercase;
  font-family: 'OpenSansCondLight', 'Titillium Web', Arial, sans-serif;
}
</style>
