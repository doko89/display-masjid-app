<script setup lang="ts">
import { ref } from 'vue'
import type { Database } from '../lib/types'

const props = defineProps<{
  db: Database
}>()

const emit = defineEmits<{
  save: [db: Database]
  close: []
}>()

const localDb = ref<Database>(JSON.parse(JSON.stringify(props.db)))

const prayerMethods = [
  { value: '0', label: 'Manual (Indonesia/Kemenag)' },
  { value: 'MWL', label: 'Muslim World League' },
  { value: 'ISNA', label: 'Islamic Society of North America' },
  { value: 'Egypt', label: 'Egyptian General Authority' },
  { value: 'Makkah', label: 'Umm Al-Qura University' },
  { value: 'Karachi', label: 'University of Islamic Sciences' },
  { value: 'Tehran', label: 'Institute of Geophysics, Tehran' },
  { value: 'Jafari', label: 'Shia Ithna-Ashari (Jafari)' },
]

const handleSave = () => {
  emit('save', localDb.value)
}

const handleClose = () => {
  emit('close')
}

const addInfo = () => {
  localDb.value.info.push(['', '', '', true])
}

const removeInfo = (index: number) => {
  localDb.value.info.splice(index, 1)
}

const addRunningText = () => {
  localDb.value.running_text.push('')
}

const removeRunningText = (index: number) => {
  localDb.value.running_text.splice(index, 1)
}
</script>

<template>
  <div class="admin-view">
    <div class="admin-header">
      <h1>Admin Panel - Display Masjid</h1>
      <button class="close-btn" @click="handleClose">Tutup</button>
    </div>

    <div class="admin-content">
      <!-- General Settings -->
      <section class="admin-section">
        <h2>Pengaturan Umum</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Nama Masjid/Musholla</label>
            <input v-model="localDb.setting.nama" type="text" />
          </div>
          <div class="form-group">
            <label>Lokasi</label>
            <input v-model="localDb.setting.lokasi" type="text" />
          </div>
          <div class="form-group">
            <label>Latitude</label>
            <input v-model.number="localDb.setting.latitude" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label>Longitude</label>
            <input v-model.number="localDb.setting.longitude" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label>Timezone</label>
            <input v-model.number="localDb.setting.timeZone" type="number" />
          </div>
        </div>
      </section>

      <!-- Prayer Times Method -->
      <section class="admin-section">
        <h2>Metode Perhitungan Sholat</h2>
        <div class="form-group">
          <label>Metode</label>
          <select v-model="localDb.prayTimesMethod">
            <option v-for="m in prayerMethods" :key="m.value" :value="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>

        <h3>Penyesuaian (derajat)</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Subuh</label>
            <input v-model="localDb.prayTimesAdjust.fajr" type="number" />
          </div>
          <div class="form-group">
            <label>Dzuhur</label>
            <input v-model="localDb.prayTimesAdjust.dhuhr" type="number" />
          </div>
          <div class="form-group">
            <label>Ashar</label>
            <input v-model="localDb.prayTimesAdjust.asr" type="number" />
          </div>
          <div class="form-group">
            <label>Maghrib</label>
            <input v-model="localDb.prayTimesAdjust.maghrib" type="number" />
          </div>
          <div class="form-group">
            <label>Isya'</label>
            <input v-model="localDb.prayTimesAdjust.isha" type="number" />
          </div>
        </div>
      </section>

      <!-- Timer Settings -->
      <section class="admin-section">
        <h2>Timer</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Info (detik)</label>
            <input v-model.number="localDb.timer.info" type="number" />
          </div>
          <div class="form-group">
            <label>Wallpaper (detik)</label>
            <input v-model.number="localDb.timer.wallpaper" type="number" />
          </div>
          <div class="form-group">
            <label>Wait Adzan (menit)</label>
            <input v-model.number="localDb.timer.wait_adzan" type="number" />
          </div>
          <div class="form-group">
            <label>Durasi Adzan (menit)</label>
            <input v-model.number="localDb.timer.adzan" type="number" />
          </div>
          <div class="form-group">
            <label>Durasi Sholat (menit)</label>
            <input v-model.number="localDb.timer.sholat" type="number" />
          </div>
        </div>
      </section>

      <!-- Iqomah Duration -->
      <section class="admin-section">
        <h2>Durasi Iqomah (menit)</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Subuh</label>
            <input v-model.number="localDb.iqomah.fajr" type="number" />
          </div>
          <div class="form-group">
            <label>Dzuhur</label>
            <input v-model.number="localDb.iqomah.dhuhr" type="number" />
          </div>
          <div class="form-group">
            <label>Ashar</label>
            <input v-model.number="localDb.iqomah.asr" type="number" />
          </div>
          <div class="form-group">
            <label>Maghrib</label>
            <input v-model.number="localDb.iqomah.maghrib" type="number" />
          </div>
          <div class="form-group">
            <label>Isya'</label>
            <input v-model.number="localDb.iqomah.isha" type="number" />
          </div>
        </div>
      </section>

      <!-- Jumat Settings -->
      <section class="admin-section">
        <h2>Sholat Jumat</h2>
        <div class="form-group checkbox">
          <input v-model="localDb.jumat.active" type="checkbox" id="jumat-active" />
          <label for="jumat-active">Aktif</label>
        </div>
        <div class="form-group">
          <label>Durasi Khutbah (menit)</label>
          <input v-model.number="localDb.jumat.duration" type="number" />
        </div>
        <div class="form-group">
          <label>Text</label>
          <input v-model="localDb.jumat.text" type="text" />
        </div>
      </section>

      <!-- Tarawih Settings -->
      <section class="admin-section">
        <h2>Sholat Tarawih</h2>
        <div class="form-group checkbox">
          <input v-model="localDb.tarawih.active" type="checkbox" id="tarawih-active" />
          <label for="tarawih-active">Aktif</label>
        </div>
        <div class="form-group">
          <label>Durasi (menit)</label>
          <input v-model.number="localDb.tarawih.duration" type="number" />
        </div>
      </section>

      <!-- Info/Carousel -->
      <section class="admin-section">
        <h2>Info/Carousel</h2>
        <button class="btn-add" @click="addInfo">+ Tambah Info</button>
        <div v-for="(info, index) in localDb.info" :key="index" class="info-item">
          <input v-model="info[0]" type="text" placeholder="Judul" />
          <textarea v-model="info[1]" placeholder="Isi"></textarea>
          <input v-model="info[2]" type="text" placeholder="Sumber" />
          <label>
            <input v-model="info[3]" type="checkbox" /> Aktif
          </label>
          <button class="btn-remove" @click="removeInfo(index)">Hapus</button>
        </div>
      </section>

      <!-- Running Text -->
      <section class="admin-section">
        <h2>Running Text</h2>
        <button class="btn-add" @click="addRunningText">+ Tambah</button>
        <div v-for="(_, index) in localDb.running_text" :key="index" class="running-item">
          <input v-model="localDb.running_text[index]" type="text" />
          <button class="btn-remove" @click="removeRunningText(index)">Hapus</button>
        </div>
      </section>
    </div>

    <div class="admin-footer">
      <button class="btn-save" @click="handleSave">Simpan</button>
      <button class="btn-cancel" @click="handleClose">Batal</button>
    </div>
  </div>
</template>

<style scoped>
.admin-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a2e;
  color: #eee;
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
}

.admin-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  padding: 0.5rem 1rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.admin-section {
  background: #16213e;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
}

.admin-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #33cccc;
  border-bottom: 1px solid #0f3460;
  padding-bottom: 0.5rem;
}

.admin-section h3 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
  color: #e2ad00;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: #aaa;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #0f3460;
  border-radius: 4px;
  background: #1a1a2e;
  color: #eee;
  font-size: 1rem;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
}

.form-group.checkbox input {
  margin-right: 0.5rem;
}

.info-item,
.running-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.info-item input,
.info-item textarea {
  padding: 0.5rem;
  border: 1px solid #0f3460;
  border-radius: 4px;
  background: #1a1a2e;
  color: #eee;
}

.info-item input[type="text"] {
  flex: 1;
}

.info-item textarea {
  flex: 2;
  min-height: 60px;
}

.running-item input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #0f3460;
  border-radius: 4px;
  background: #1a1a2e;
  color: #eee;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: #33cccc;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.btn-remove {
  padding: 0.5rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.admin-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: #16213e;
  border-top: 1px solid #0f3460;
}

.btn-save {
  padding: 0.75rem 2rem;
  background: #33cccc;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}

.btn-cancel {
  padding: 0.75rem 2rem;
  background: #555;
  color: #eee;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
</style>
