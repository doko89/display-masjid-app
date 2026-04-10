export interface Access {
  user: string
  pass: string
}

export interface Setting {
  nama: string
  lokasi: string
  latitude: number
  longitude: number
  timeZone: number
  dst: number | string
}

export interface Timer {
  info: number
  wallpaper: number
  wait_adzan: number
  adzan: number
  sholat: number
}

export interface Jumat {
  active: boolean
  duration: number
  text: string
}

export interface Tarawih {
  active: boolean
  duration: number
}

export interface Database {
  akses: Access
  setting: Setting
  prayTimesMethod: string | '0'
  prayTimesAdjust: Record<string, number | string>
  prayTimesTune: Record<string, number>
  prayName: Record<string, string>
  timeName: Record<string, string>
  dayName: Record<string, string>
  monthName: Record<string, string>
  timer: Timer
  iqomah: Record<string, number>
  jumat: Jumat
  tarawih: Tarawih
  info: [string, string, string, boolean][]
  running_text: string[]
}

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export interface PrayerTimes {
  fajr: string
  sunrise?: string
  dhuhr: string
  asr: string
  sunset?: string
  maghrib: string
  isha: string
}

export type DisplayState =
  | 'normal'
  | 'countdown_adzan'
  | 'adzan'
  | 'countdown_iqomah'
  | 'sholat'
  | 'khutbah'
  | 'countdown_next'

export interface ScheduleItem {
  key: PrayerKey
  name: string
  time: string
  moment: Date
}
