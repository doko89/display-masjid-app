<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  logoUrl?: string
}>()

const logoStyle = computed(() => {
  if (props.logoUrl) {
    return {
      backgroundImage: `url(${props.logoUrl})`,
    }
  }
  return {}
})
</script>

<template>
  <div class="logo-display" :style="logoStyle" v-if="logoUrl"></div>
</template>

<style scoped>
.logo-display {
  height: 7vw;
  width: 70vw;
  position: fixed;
  bottom: 5.6vw;
  right: 2vw;
  background-size: contain;
  background-position: right bottom;
  background-repeat: no-repeat;
}
</style>
