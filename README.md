# Display Masjid

Aplikasi display informasi masjid/musholla untuk TV menggunakan Tauri v2 + Vue 3 + TypeScript.

## Fitur

- **Jadwal Sholat** - Perhitungan otomatis 5 waktu sholat (Subuh, Dzuhur, Ashar, Maghrib, Isya)
- **Countdown** - Timer countdown menuju sholat dan iqomah
- **Display Fullscreen** - Tampilan adzan, sholat, dan khutbah
- **Info Carousel** - Rotasi kutipan/hadist
- **Running Text** - Teks berjalan di bagian bawah
- **Wallpaper Slideshow** - Background gambar yang rotate
- **Admin Panel** - Konfigurasi via browser (tekan A/ESC)

## Screenshot

*(Tambahkan screenshot di sini)*

## Keyboard Shortcuts

| Tombol | Fungsi |
|--------|--------|
| `F` / `F11` | Toggle fullscreen |
| `A` / `ESC` | Toggle admin mode |

## Instalasi

### Prerequisites

- Node.js 18+
- Bun atau npm
- Rust (untuk build Tauri)
- Xcode Command Line Tools (macOS)

### Development

```bash
# Install dependencies
bun install

# Run development server
bun run tauri dev
```

### Build

```bash
# Build untuk production
bun run tauri build
```

## Struktur Project

```
kaffah-app/
├── src/                    # Vue 3 frontend
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── lib/               # Libraries (PrayTimes, types)
│   ├── views/             # Page views
│   ├── App.vue            # Main app
│   └── main.ts            # Entry point
├── src-tauri/             # Rust backend
│   ├── src/lib.rs         # Tauri commands
│   └── tauri.conf.json    # Tauri config
├── public/                # Static assets
│   ├── wallpaper/         # User wallpapers
│   ├── fonts/             # Fonts
│   └── beep.mp3           # Audio beep
└── dist/                  # Build output
```

## Konfigurasi

Data konfigurasi disimpan di app data directory:
- **Windows**: `%APPDATA%\com.out2297.kaffah-app\`
- **macOS**: `~/Library/Application Support/com.out2297.kaffah-app/`
- **Linux**: `~/.config/com.out2297.kaffah-app/`

Struktur `database.json`:
```json
{
  "setting": { "nama", "lokasi", "latitude", "longitude", "timeZone" },
  "prayTimesMethod": "0",
  "prayTimesAdjust": { "fajr": 20, "isha": 18 },
  "timer": { "info": 5, "wallpaper": 15, "wait_adzan": 1, "adzan": 3, "sholat": 20 },
  "iqomah": { "fajr": 10, "dhuhr": 10, ... },
  "jumat": { "active": true, "duration": 60 },
  "tarawih": { "active": true, "duration": 180 },
  "info": [[title, body, source, active], ...],
  "running_text": ["text1", "text2", ...]
}
```

## Lisensi

MIT License - see LICENSE file
