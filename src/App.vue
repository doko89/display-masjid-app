<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { Database } from './lib/types'
import DisplayView from './views/DisplayView.vue'
import AdminView from './views/AdminView.vue'

const isAdminMode = ref(false)
const db = ref<Database | null>(null)
const wallpapers = ref<string[]>([])
const logoUrl = ref<string | undefined>(undefined)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isFullscreen = ref(true)
const showToast = ref(false)
const toastMessage = ref('')

// Default database for initial state
const defaultDb: Database = {
  akses: { user: 'admin', pass: 'admin' },
  setting: {
    nama: 'Musholla Ad-Din',
    lokasi: 'Bekasi',
    latitude: -6.14,
    longitude: 106.59,
    timeZone: 7,
    dst: 0,
  },
  prayTimesMethod: '0',
  prayTimesAdjust: { fajr: 20, dhuhr: 0, asr: 'Standard', maghrib: 0, isha: 18 },
  prayTimesTune: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  prayName: { fajr: 'Subuh', dhuhr: 'Dzuhur', asr: 'Ashar', maghrib: 'Maghrib', isha: "Isya'" },
  timeName: { Hours: 'Jam', Minutes: 'Menit', Seconds: 'Detik' },
  dayName: {
    Sunday: 'Minggu',
    Monday: 'Senin',
    Tuesday: 'Selasa',
    Wednesday: 'Rabu',
    Thursday: 'Kamis',
    Friday: "Jum'at",
    Saturday: 'Sabtu',
  },
  monthName: {
    January: 'Januari',
    February: 'Februari',
    March: 'Maret',
    April: 'April',
    May: 'Mei',
    June: 'Juni',
    July: 'Juli',
    August: 'Agustus',
    September: 'September',
    October: 'Oktober',
    November: 'November',
    December: 'Desember',
  },
  timer: { info: 5, wallpaper: 15, wait_adzan: 1, adzan: 3, sholat: 20 },
  iqomah: { fajr: 10, dhuhr: 10, asr: 10, maghrib: 10, isha: 10 },
  jumat: { active: true, duration: 60, text: 'Harap diam saat khotib khutbah' },
  tarawih: { active: true, duration: 180 },
  info: [
    ['Aplikasi Display-Masjid', 'Selamat datang di aplikasi Display Masjid', 'Display|Masjid V.1.0.0', true],
  ],
  running_text: ['Selamat datang di aplikasi Display-Masjid'],
}

const loadData = async () => {
  try {
    // Try to read database from app data
    db.value = await invoke<Database>('read_database')
  } catch {
    // If no database exists, use default
    db.value = defaultDb
    // Try to save the default database
    try {
      await invoke('save_database', { data: defaultDb })
    } catch {
      // Ignore save error on first load
    }
  }

  try {
    // Load wallpapers from app data directory
    const wallpaperFiles = await invoke<string[]>('get_wallpapers')
    wallpapers.value = []
    for (const file of wallpaperFiles) {
      const url = await invoke<string>('get_wallpaper_url', { filename: file })
      wallpapers.value.push(url)
    }

    // If no user wallpapers, use bundled wallpapers
    if (wallpapers.value.length === 0) {
      wallpapers.value = [
        '/wallpaper/15822524510.jpg',
        '/wallpaper/15822524511.jpg',
        '/wallpaper/15822524740.jpg',
      ]
    }
  } catch {
    // Fallback to bundled wallpapers
    wallpapers.value = [
      '/wallpaper/15822524510.jpg',
      '/wallpaper/15822524511.jpg',
      '/wallpaper/15822524740.jpg',
    ]
  }

  try {
    // Load logos
    const logoFiles = await invoke<string[]>('get_logos')
    if (logoFiles.length > 0) {
      logoUrl.value = await invoke<string>('get_logo_url', { filename: logoFiles[0] })
    }
  } catch {
    logoUrl.value = undefined
  }

  isLoading.value = false
}

const handleSave = async (newDb: Database) => {
  try {
    await invoke('save_database', { data: newDb })
    db.value = newDb
    isAdminMode.value = false
  } catch (e) {
    error.value = `Gagal menyimpan: ${e}`
  }
}

const handleClose = () => {
  isAdminMode.value = false
}

const showNotification = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const toggleAdminMode = () => {
  isAdminMode.value = !isAdminMode.value
  showNotification(isAdminMode.value ? 'Admin Mode' : 'Display Mode')
}

const toggleFullscreen = async () => {
  try {
    const appWindow = getCurrentWindow()
    const current = await appWindow.isFullscreen()
    const newState = !current
    await appWindow.setFullscreen(newState)
    isFullscreen.value = newState
    showNotification(newState ? 'Fullscreen ON' : 'Fullscreen OFF')
  } catch (e) {
    console.log('Tauri fullscreen error:', e)
    // Fallback to web Fullscreen API
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        isFullscreen.value = true
        showNotification('Fullscreen ON')
      } else {
        await document.exitFullscreen()
        isFullscreen.value = false
        showNotification('Fullscreen OFF')
      }
    } catch (e2) {
      console.log('Web fullscreen also failed:', e2)
      showNotification('Fullscreen Error')
    }
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  // Press 'F' or 'F11' to toggle fullscreen
  if (e.key === 'f' || e.key === 'F' || e.key === 'F11') {
    e.preventDefault()
    toggleFullscreen()
  }
  // Press 'A' or 'Escape' to toggle admin mode
  else if (e.key === 'a' || e.key === 'A' || e.key === 'Escape') {
    e.preventDefault()
    toggleAdminMode()
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div id="app">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Memuat...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <AdminView
      v-else-if="isAdminMode && db"
      :db="db"
      @save="handleSave"
      @close="handleClose"
    />

    <DisplayView
      v-else-if="db"
      :db="db"
      :wallpapers="wallpapers"
      :logo-url="logoUrl"
    />

    <!-- Admin mode hint -->
    <div class="admin-hint" v-if="!isAdminMode">
      Tekan <kbd>F</kbd> fullscreen | <kbd>A</kbd>/<kbd>ESC</kbd> admin
    </div>

    <!-- Toast notification -->
    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Titillium Web', Arial, sans-serif;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #122;
  color: #fff;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #33cccc;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.admin-hint {
  position: fixed;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: #888;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 300;
}

.admin-hint kbd {
  background: #333;
  padding: 2px 6px;
  border-radius: 3px;
  margin: 0 2px;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #33cccc;
  padding: 20px 40px;
  border-radius: 10px;
  font-size: 24px;
  z-index: 9999;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
}
</style>
