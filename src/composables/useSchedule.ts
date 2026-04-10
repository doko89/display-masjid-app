import { ref, computed } from 'vue'
import type { Database, DisplayState, PrayerKey } from '../lib/types'
import { usePrayerTimes } from './usePrayerTimes'

export function useSchedule() {
  const { getPrayerMoment, getNextPrayer, prayerTimesToday } = usePrayerTimes()

  const displayState = ref<DisplayState>('normal')
  const currentPrayerName = ref<string>('')
  const countdownTarget = ref<Date | null>(null)
  const countdownTitle = ref<string>('')
  const isFriday = ref<boolean>(false)

  const checkSchedule = (db: Database): void => {
    const now = new Date()
    isFriday.value = now.getDay() === 5 // Friday = 5

    const times = prayerTimesToday.value
    if (!times) return

    const prayerKeys: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

    // Check each prayer time
    for (const key of prayerKeys) {
      const prayerMoment = getPrayerMoment(key, db)
      const waitAdzanMoment = new Date(prayerMoment.getTime() - db.timer.wait_adzan * 60 * 1000)
      const iqomahEndMoment = new Date(prayerMoment.getTime() + db.timer.adzan * 60 * 1000)
      const iqomahDuration = (db.iqomah[key] || 10) * 60 * 1000
      const sholatEndMoment = new Date(iqomahEndMoment.getTime() + iqomahDuration)

      // Check if it's time for countdown before adzan
      if (
        now >= waitAdzanMoment &&
        now < prayerMoment &&
        displayState.value === 'normal'
      ) {
        startCountdownAdzan(prayerMoment, db.prayName[key])
        return
      }

      // Check if it's prayer time (show adzan)
      if (
        now >= prayerMoment &&
        now < iqomahEndMoment &&
        (displayState.value === 'normal' || displayState.value === 'countdown_adzan')
      ) {
        showAdzan(db.prayName[key])
        return
      }

      // Check if iqomah should start
      if (
        now >= iqomahEndMoment &&
        now < new Date(iqomahEndMoment.getTime() + iqomahDuration) &&
        displayState.value === 'adzan'
      ) {
        // Special handling for Friday Dhuhr (Khutbah instead of Iqomah)
        if (isFriday.value && db.jumat.active && key === 'dhuhr') {
          showKhutbah(db)
        } else {
          startCountdownIqomah(
            new Date(iqomahEndMoment.getTime() + iqomahDuration),
            db.prayName[key]
          )
        }
        return
      }
    }

    // If in a special state, check if it should end
    if (displayState.value !== 'normal') {
      // These are handled by the countdown timer components
    }
  }

  const startCountdownAdzan = (target: Date, prayerName: string): void => {
    displayState.value = 'countdown_adzan'
    countdownTarget.value = target
    countdownTitle.value = `Menuju ${prayerName}`
    currentPrayerName.value = prayerName
  }

  const startCountdownIqomah = (target: Date, prayerName: string): void => {
    displayState.value = 'countdown_iqomah'
    countdownTarget.value = target
    countdownTitle.value = `IQOMAH`
    currentPrayerName.value = prayerName
  }

  const showAdzan = (prayerName: string): void => {
    displayState.value = 'adzan'
    currentPrayerName.value = prayerName
  }

  const showKhutbah = (db: Database): void => {
    displayState.value = 'khutbah'
    countdownTarget.value = null
  }

  const showSholat = (db: Database): void => {
    displayState.value = 'sholat'
    countdownTarget.value = null
  }

  const endSpecialDisplay = (db: Database): void => {
    displayState.value = 'normal'
    countdownTarget.value = null
    currentPrayerName.value = ''

    // After ending, start countdown to next prayer
    const next = getNextPrayer(db)
    if (next) {
      const waitAdzanMoment = new Date(next.moment.getTime() - db.timer.wait_adzan * 60 * 1000)
      if (waitAdzanMoment > new Date()) {
        startCountdownAdzan(next.moment, db.prayName[next.key])
      }
    }
  }

  const resetToNormal = (): void => {
    displayState.value = 'normal'
    countdownTarget.value = null
    countdownTitle.value = ''
    currentPrayerName.value = ''
  }

  return {
    displayState,
    currentPrayerName,
    countdownTarget,
    countdownTitle,
    isFriday,
    checkSchedule,
    startCountdownAdzan,
    startCountdownIqomah,
    showAdzan,
    showKhutbah,
    showSholat,
    endSpecialDisplay,
    resetToNormal,
  }
}
