// PrayTimes.ts - Prayer Times Calculator (ver 2.3)
// Ported to TypeScript from PrayTimes.js
// Copyright (C) 2007-2011 PrayTimes.org

export interface CalculationMethod {
  name: string
  params: Record<string, number | string>
}

export interface PrayerTimesConfig {
  imsak: string
  dhuhr: string
  asr: string
  highLats: string
}

export interface TimeOffsets {
  imsak?: number
  fajr?: number
  sunrise?: number
  dhuhr?: number
  asr?: number
  sunset?: number
  maghrib?: number
  isha?: number
  midnight?: number
}

export interface PrayerTimesResult {
  imsak: string
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  sunset: string
  maghrib: string
  isha: string
  midnight: string
}

interface SunPosition {
  declination: number
  equation: number
}

const timeNames: Record<string, string> = {
  imsak: 'Imsak',
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  sunset: 'Sunset',
  maghrib: 'Maghrib',
  isha: 'Isha',
  midnight: 'Midnight',
}

const methods: Record<string, CalculationMethod> = {
  MWL: {
    name: 'Muslim World League',
    params: { fajr: 18, isha: 17 },
  },
  ISNA: {
    name: 'Islamic Society of North America (ISNA)',
    params: { fajr: 15, isha: 15 },
  },
  Egypt: {
    name: 'Egyptian General Authority of Survey',
    params: { fajr: 19.5, isha: 17.5 },
  },
  Makkah: {
    name: 'Umm Al-Qura University, Makkah',
    params: { fajr: 18.5, isha: '90 min' },
  },
  Karachi: {
    name: 'University of Islamic Sciences, Karachi',
    params: { fajr: 18, isha: 18 },
  },
  Tehran: {
    name: 'Institute of Geophysics, University of Tehran',
    params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'Jafari' },
  },
  Jafari: {
    name: 'Shia Ithna-Ashari, Leva Institute, Qum',
    params: { fajr: 16, isha: 14, maghrib: 4, midnight: 'Jafari' },
  },
}

const defaultParams: Record<string, string> = {
  maghrib: '0 min',
  midnight: 'Standard',
}

const DMath = {
  dtr(d: number): number {
    return (d * Math.PI) / 180.0
  },
  rtd(r: number): number {
    return (r * 180.0) / Math.PI
  },

  sin(d: number): number {
    return Math.sin(this.dtr(d))
  },
  cos(d: number): number {
    return Math.cos(this.dtr(d))
  },
  tan(d: number): number {
    return Math.tan(this.dtr(d))
  },

  arcsin(d: number): number {
    return this.rtd(Math.asin(d))
  },
  arccos(d: number): number {
    return this.rtd(Math.acos(d))
  },
  arctan(d: number): number {
    return this.rtd(Math.atan(d))
  },

  arccot(x: number): number {
    return this.rtd(Math.atan(1 / x))
  },
  arctan2(y: number, x: number): number {
    return this.rtd(Math.atan2(y, x))
  },

  fixAngle(a: number): number {
    return this.fix(a, 360)
  },
  fixHour(a: number): number {
    return this.fix(a, 24)
  },

  fix(a: number, b: number): number {
    a = a - b * Math.floor(a / b)
    return a < 0 ? a + b : a
  },
}

export class PrayTimes {
  private calcMethod = 'MWL'
  private setting: PrayerTimesConfig = {
    imsak: '10 min',
    dhuhr: '0 min',
    asr: 'Standard',
    highLats: 'NightMiddle',
  }
  private timeFormat = '24h'
  private timeSuffixes = ['am', 'pm']
  private invalidTime = '-----'
  private numIterations = 1
  private offset: TimeOffsets = {}

  private lat = 0
  private lng = 0
  private elv = 0
  private timeZone = 0
  private jDate = 0

  constructor(method: string = 'MWL') {
    // set methods defaults
    const defParams = defaultParams
    for (const i in methods) {
      const params = methods[i].params
      for (const j in defParams) {
        if (typeof params[j] === 'undefined') {
          params[j] = defParams[j]
        }
      }
    }

    // initialize settings
    this.calcMethod = methods[method] ? method : this.calcMethod
    const params = methods[this.calcMethod].params
    for (const id in params) {
      this.setting[id] = params[id] as string
    }

    // init time offsets
    for (const i in timeNames) {
      ;(this.offset as Record<string, number>)[i] = 0
    }
  }

  setMethod(method: string): void {
    if (methods[method]) {
      this.adjust(methods[method].params)
      this.calcMethod = method
    }
  }

  adjust(params: Record<string, number | string>): void {
    for (const id in params) {
      this.setting[id] = params[id] as string
    }
  }

  tune(timeOffsets: TimeOffsets): void {
    for (const i in timeOffsets) {
      ;(this.offset as Record<string, number>)[i] = timeOffsets[i] as number
    }
  }

  getMethod(): string {
    return this.calcMethod
  }

  getSetting(): PrayerTimesConfig {
    return { ...this.setting }
  }

  getOffsets(): TimeOffsets {
    return { ...this.offset }
  }

  getDefaults(): Record<string, CalculationMethod> {
    return { ...methods }
  }

  getTimes(
    date: Date,
    coords: number[],
    timezone: number | undefined,
    dst: number | undefined,
    format: string | undefined
  ): PrayerTimesResult {
    this.lat = 1 * coords[0]
    this.lng = 1 * coords[1]
    this.elv = coords[2] ? 1 * coords[2] : 0
    this.timeFormat = format || this.timeFormat

    const dateArr =
      date.constructor === Date
        ? [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        : [date.getFullYear(), date.getMonth() + 1, date.getDate()]

    if (typeof timezone === 'undefined' || timezone === 'auto') {
      timezone = this.getTimeZone(dateArr)
    }
    if (typeof dst === 'undefined' || dst === 'auto') {
      dst = this.getDst(dateArr)
    }
    this.timeZone = 1 * timezone + (1 * dst ? 1 : 0)
    this.jDate = this.julian(dateArr[0], dateArr[1], dateArr[2]) - this.lng / (15 * 24)

    return this.computeTimes()
  }

  getFormattedTime(time: number, format: string, suffixes?: string[]): string {
    if (isNaN(time)) return this.invalidTime
    if (format === 'Float') return String(time)
    suffixes = suffixes || this.timeSuffixes

    time = DMath.fixHour(time + 0.5 / 60) // add 0.5 minutes to round
    const hours = Math.floor(time)
    const minutes = Math.floor((time - hours) * 60)
    const suffix = format === '12h' ? suffixes[hours < 12 ? 0 : 1] : ''
    const hour =
      format === '24h'
        ? this.twoDigitsFormat(hours)
        : String(((hours + 12 - 1) % 12) + 1)
    return hour + ':' + this.twoDigitsFormat(minutes) + (suffix ? ' ' + suffix : '')
  }

  private midDay(time: number): number {
    const eqt = this.sunPosition(this.jDate + time).equation
    const noon = DMath.fixHour(12 - eqt)
    return noon
  }

  private sunAngleTime(angle: number, time: number, direction: string): number {
    const decl = this.sunPosition(this.jDate + time).declination
    const noon = this.midDay(time)
    const t =
      (1 / 15) *
      DMath.arccos(
        (-DMath.sin(angle) - DMath.sin(decl) * DMath.sin(this.lat)) /
        (DMath.cos(decl) * DMath.cos(this.lat))
      )
    return noon + (direction === 'ccw' ? -t : t)
  }

  private asrTime(factor: number, time: number): number {
    const decl = this.sunPosition(this.jDate + time).declination
    const angle = -DMath.arccot(factor + Math.tan(Math.abs(this.lat - decl)))
    return this.sunAngleTime(angle, time)
  }

  private sunPosition(jd: number): SunPosition {
    const D = jd - 2451545.0
    const g = DMath.fixAngle(357.529 + 0.98560028 * D)
    const q = DMath.fixAngle(280.459 + 0.98564736 * D)
    const L = DMath.fixAngle(
      q + 1.915 * DMath.sin(g) + 0.02 * DMath.sin(2 * g)
    )

    const R = 1.00014 - 0.01671 * DMath.cos(g) - 0.00014 * DMath.cos(2 * g)
    const e = 23.439 - 0.00000036 * D

    const RA = DMath.arctan2(DMath.cos(e) * DMath.sin(L), DMath.cos(L)) / 15
    const eqt = q / 15 - DMath.fixHour(RA)
    const decl = DMath.arcsin(DMath.sin(e) * DMath.sin(L))

    return { declination: decl, equation: eqt }
  }

  private julian(year: number, month: number, day: number): number {
    if (month <= 2) {
      year -= 1
      month += 12
    }
    const A = Math.floor(year / 100)
    const B = 2 - A + Math.floor(A / 4)

    const JD =
      Math.floor(365.25 * (year + 4716)) +
      Math.floor(30.6001 * (month + 1)) +
      day +
      B -
      1524.5
    return JD
  }

  private computePrayerTimes(times: Record<string, number>): Record<string, number> {
    times = this.dayPortion(times)
    const params = this.setting

    const imsak = this.sunAngleTime(this.eval(params.imsak), times.imsak, 'ccw')
    const fajr = this.sunAngleTime(this.eval(params.fajr), times.fajr, 'ccw')
    const sunrise = this.sunAngleTime(this.riseSetAngle(), times.sunrise, 'ccw')
    const dhuhr = this.midDay(times.dhuhr)
    const asr = this.asrTime(this.asrFactor(params.asr), times.asr)
    const sunset = this.sunAngleTime(this.riseSetAngle(), times.sunset)
    const maghrib = this.sunAngleTime(this.eval(params.maghrib), times.maghrib)
    const isha = this.sunAngleTime(this.eval(params.isha), times.isha)

    return {
      imsak,
      fajr,
      sunrise,
      dhuhr,
      asr,
      sunset,
      maghrib,
      isha,
    }
  }

  private computeTimes(): PrayerTimesResult {
    // default times
    const times: Record<string, number> = {
      imsak: 5,
      fajr: 5,
      sunrise: 6,
      dhuhr: 12,
      asr: 13,
      sunset: 18,
      maghrib: 18,
      isha: 18,
    }

    // main iterations
    for (let i = 1; i <= this.numIterations; i++) {
      times.imsak
      times.fajr
      times.sunrise
      times.dhuhr
      times.asr
      times.sunset
      times.maghrib
      times.isha
      times.imsak
      times.fajr
      times.sunrise
      times.dhuhr
      times.asr
      times.sunset
      times.maghrib
      times.isha
    }

    const computed = this.computePrayerTimes(times)

    let adjusted = this.adjustTimes(computed)

    // add midnight time
    adjusted.midnight =
      this.setting.midnight === 'Jafari'
        ? adjusted.sunset + this.timeDiff(adjusted.sunset, adjusted.fajr) / 2
        : adjusted.sunset + this.timeDiff(adjusted.sunset, adjusted.sunrise) / 2

    adjusted = this.tuneTimes(adjusted)
    return this.modifyFormats(adjusted)
  }

  private adjustTimes(times: Record<string, number>): Record<string, number> {
    const params = this.setting
    for (const i in times) {
      times[i] += this.timeZone - this.lng / 15
    }

    if (params.highLats !== 'None') {
      times = this.adjustHighLats(times)
    }

    if (this.isMin(params.imsak)) {
      times.imsak = times.fajr - this.eval(params.imsak) / 60
    }
    if (this.isMin(params.maghrib)) {
      times.maghrib = times.sunset + this.eval(params.maghrib) / 60
    }
    if (this.isMin(params.isha)) {
      times.isha = times.maghrib + this.eval(params.isha) / 60
    }
    times.dhuhr += this.eval(params.dhuhr) / 60

    return times
  }

  private asrFactor(asrParam: string): number {
    const factor: Record<string, number> = { Standard: 1, Hanafi: 2 }
    return factor[asrParam] || this.eval(asrParam)
  }

  private riseSetAngle(): number {
    const angle = 0.0347 * Math.sqrt(this.elv)
    return 0.833 + angle
  }

  private tuneTimes(times: Record<string, number>): Record<string, number> {
    for (const i in times) {
      times[i] += ((this.offset as Record<string, number>)[i] || 0) / 60
    }
    return times
  }

  private modifyFormats(
    times: Record<string, number>
  ): PrayerTimesResult {
    const result: Record<string, string> = {}
    for (const i in times) {
      result[i] = this.getFormattedTime(times[i], this.timeFormat)
    }
    return result as PrayerTimesResult
  }

  private adjustHighLats(times: Record<string, number>): Record<string, number> {
    const params = this.setting
    const nightTime = this.timeDiff(times.sunset, times.sunrise)

    times.imsak = this.adjustHLTime(
      times.imsak,
      times.sunrise,
      this.eval(params.imsak),
      nightTime,
      'ccw'
    )
    times.fajr = this.adjustHLTime(
      times.fajr,
      times.sunrise,
      this.eval(params.fajr),
      nightTime,
      'ccw'
    )
    times.isha = this.adjustHLTime(
      times.isha,
      times.sunset,
      this.eval(params.isha),
      nightTime
    )
    times.maghrib = this.adjustHLTime(
      times.maghrib,
      times.sunset,
      this.eval(params.maghrib),
      nightTime
    )

    return times
  }

  private adjustHLTime(
    time: number,
    base: number,
    angle: number,
    night: number,
    direction?: string
  ): number {
    const portion = this.nightPortion(angle, night)
    const timeDiff =
      direction === 'ccw'
        ? this.timeDiff(time, base)
        : this.timeDiff(base, time)
    if (isNaN(time) || timeDiff > portion)
      time = base + (direction === 'ccw' ? -portion : portion)
    return time
  }

  private nightPortion(angle: number, night: number): number {
    const method = this.setting.highLats
    let portion = 1 / 2
    if (method === 'AngleBased') portion = (1 / 60) * angle
    if (method === 'OneSeventh') portion = 1 / 7
    return portion * night
  }

  private dayPortion(times: Record<string, number>): Record<string, number> {
    for (const i in times) {
      times[i] /= 24
    }
    return times
  }

  private getTimeZone(date: number[]): number {
    const year = date[0]
    const t1 = this.gmtOffset([year, 0, 1])
    const t2 = this.gmtOffset([year, 6, 1])
    return Math.min(t1, t2)
  }

  private getDst(date: number[]): number {
    return 1 * (this.gmtOffset(date) !== this.getTimeZone(date))
  }

  private gmtOffset(date: number[]): number {
    const localDate = new Date(date[0], date[1] - 1, date[2], 12, 0, 0, 0)
    const GMTString = localDate.toGMTString()
    const GMTDate = new Date(GMTString.substring(0, GMTString.lastIndexOf(' ') - 1))
    const hoursDiff = (localDate.getTime() - GMTDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff
  }

  private eval(str: string): number {
    return 1 * (str + '').split(/[^0-9.+-]/)[0]
  }

  private isMin(arg: string): boolean {
    return (arg + '').indexOf('min') !== -1
  }

  private timeDiff(time1: number, time2: number): number {
    return DMath.fixHour(time2 - time1)
  }

  private twoDigitsFormat(num: number): string {
    return num < 10 ? '0' + num : String(num)
  }
}

export const prayTimes = new PrayTimes()
