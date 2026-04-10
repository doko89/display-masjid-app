import { ref, computed, onUnmounted } from 'vue'

export interface CountdownResult {
  hours: string
  minutes: string
  seconds: string
  totalSeconds: number
  isExpired: boolean
}

export function useCountdown() {
  const targetTime = ref<Date | null>(null)
  const isRunning = ref<boolean>(false)
  const intervalId = ref<ReturnType<typeof setInterval> | null>(null)

  const countdown = computed<CountdownResult>(() => {
    if (!targetTime.value) {
      return { hours: '00', minutes: '00', seconds: '00', totalSeconds: 0, isExpired: true }
    }

    const now = new Date()
    const diff = targetTime.value.getTime() - now.getTime()

    if (diff <= 0) {
      return { hours: '00', minutes: '00', seconds: '00', totalSeconds: 0, isExpired: true }
    }

    const totalSeconds = Math.floor(diff / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      totalSeconds,
      isExpired: false,
    }
  })

  const start = (target: Date, onTick?: (result: CountdownResult) => void, onExpire?: () => void): void => {
    stop()
    targetTime.value = target
    isRunning.value = true

    intervalId.value = setInterval(() => {
      const result = countdown.value

      if (onTick) {
        onTick(result)
      }

      if (result.isExpired) {
        stop()
        if (onExpire) {
          onExpire()
        }
      }
    }, 1000)
  }

  const stop = (): void => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    isRunning.value = false
    targetTime.value = null
  }

  const pause = (): void => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    isRunning.value = false
  }

  onUnmounted(() => {
    stop()
  })

  return {
    targetTime,
    isRunning,
    countdown,
    start,
    stop,
    pause,
  }
}
