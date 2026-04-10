import { ref } from 'vue'
import { PrayTimes } from '../lib/PrayTimes'
import type { Database, PrayerTimes, PrayerKey } from '../lib/types'

const pt = new PrayTimes('MWL')

export function usePrayerTimes() {
  const prayerTimesToday = ref<PrayerTimes | null>(null)
  const prayerTimesTomorrow = ref<PrayerTimes | null>(null)

  const calculateTimes = (
    date: Date,
    db: Database
  ): PrayerTimes => {
    const { latitude, longitude, timeZone } = db.setting

    // Set calculation method
    if (db.prayTimesMethod === '0') {
      // Manual method
      const adjust: Record<string, number | string> = {}
      for (const [key, value] of Object.entries(db.prayTimesAdjust)) {
        if (value !== '' && value !== 'Standard') {
          adjust[key] = value
        }
      }
      if (Object.keys(adjust).length > 0) {
        pt.adjust(adjust)
      }
    } else {
      pt.setMethod(db.prayTimesMethod as string)
    }

    // Apply tune offsets
    const tune: Record<string, number> = {}
    for (const [key, value] of Object.entries(db.prayTimesTune)) {
      if (value !== 0) {
        tune[key] = value
      }
    }
    if (Object.keys(tune).length > 0) {
      pt.tune(tune)
    }

    const times = pt.getTimes(
      date,
      [latitude, longitude],
      timeZone,
      typeof db.setting.dst === 'number' ? db.setting.dst : 0,
      '24h'
    )

    return times as PrayerTimes
  }

  const updatePrayerTimes = (db: Database) => {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    prayerTimesToday.value = calculateTimes(today, db)
    prayerTimesTomorrow.value = calculateTimes(tomorrow, db)
  }

  const prayerKeys: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

  const getPrayerMoment = (
    prayerKey: PrayerKey
  ): Date => {
    const times = prayerTimesToday.value
    if (!times) return new Date()

    const timeStr = times[prayerKey]
    if (!timeStr || timeStr === '-----') return new Date()

    const [hours, minutes] = timeStr.split(':').map(Number)
    const moment = new Date()
    moment.setHours(hours, minutes, 0, 0)
    return moment
  }

  const getNextPrayer = (): { key: PrayerKey; moment: Date } | null => {
    const now = new Date()
    const times = prayerTimesToday.value
    if (!times) return null

    for (const key of prayerKeys) {
      const moment = getPrayerMoment(key)
      if (now < moment) {
        return { key, moment }
      }
    }

    // After Isha, next prayer is Fajr tomorrow
    const tomorrow = prayerTimesTomorrow.value
    if (tomorrow) {
      const [hours, minutes] = tomorrow.fajr.split(':').map(Number)
      const nextFajr = new Date()
      nextFajr.setDate(nextFajr.getDate() + 1)
      nextFajr.setHours(hours, minutes, 0, 0)
      return { key: 'fajr', moment: nextFajr }
    }

    return null
  }

  const isCurrentPrayer = (
    prayerKey: PrayerKey
  ): boolean => {
    const now = new Date()
    const times = prayerTimesToday.value
    if (!times) return false

    const keyIndex = prayerKeys.indexOf(prayerKey)
    const prayerMoment = getPrayerMoment(prayerKey)

    // Current prayer is active 5 minutes before until 5 minutes after
    const startWindow = new Date(prayerMoment.getTime() - 5 * 60 * 1000)
    const endWindow = new Date(prayerMoment.getTime() + 5 * 60 * 1000)

    if (now >= startWindow && now <= endWindow) {
      // Check if any later prayer has passed
      for (let i = keyIndex + 1; i < prayerKeys.length; i++) {
        const laterMoment = getPrayerMoment(prayerKeys[i])
        if (now > laterMoment) {
          return false
        }
      }
      return true
    }

    return false
  }

  return {
    prayerTimesToday,
    prayerTimesTomorrow,
    calculateTimes,
    updatePrayerTimes,
    getPrayerMoment,
    getNextPrayer,
    isCurrentPrayer,
    prayerKeys,
  }
}
