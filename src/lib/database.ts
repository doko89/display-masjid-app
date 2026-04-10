import { invoke } from '@tauri-apps/api/core'
import type { Database } from './types'

export async function readDatabase(): Promise<Database> {
  return await invoke<Database>('read_database')
}

export async function saveDatabase(data: Database): Promise<void> {
  await invoke('save_database', { data })
}

export async function getWallpapers(): Promise<string[]> {
  return await invoke<string[]>('get_wallpapers')
}

export async function getLogos(): Promise<string[]> {
  return await invoke<string[]>('get_logos')
}

export async function getWallpaperUrl(filename: string): Promise<string> {
  return await invoke<string>('get_wallpaper_url', { filename })
}

export async function getLogoUrl(filename: string): Promise<string> {
  return await invoke<string>('get_logo_url', { filename })
}
