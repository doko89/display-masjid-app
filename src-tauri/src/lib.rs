use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Access {
    pub user: String,
    pub pass: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Setting {
    pub nama: String,
    pub lokasi: String,
    pub latitude: f64,
    pub longitude: f64,
    #[serde(rename = "timeZone")]
    pub time_zone: f64,
    pub dst: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Timer {
    pub info: u32,
    pub wallpaper: u32,
    #[serde(rename = "wait_adzan")]
    pub wait_adzan: u32,
    pub adzan: u32,
    pub sholat: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Jumat {
    pub active: bool,
    pub duration: u32,
    pub text: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Tarawih {
    pub active: bool,
    pub duration: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Database {
    pub akses: Access,
    pub setting: Setting,
    #[serde(rename = "prayTimesMethod")]
    pub pray_times_method: serde_json::Value,
    #[serde(rename = "prayTimesAdjust")]
    pub pray_times_adjust: serde_json::Value,
    #[serde(rename = "prayTimesTune")]
    pub pray_times_tune: serde_json::Value,
    #[serde(rename = "prayName")]
    pub pray_name: serde_json::Value,
    #[serde(rename = "timeName")]
    pub time_name: serde_json::Value,
    #[serde(rename = "dayName")]
    pub day_name: serde_json::Value,
    #[serde(rename = "monthName")]
    pub month_name: serde_json::Value,
    pub timer: Timer,
    pub iqomah: serde_json::Value,
    pub jumat: Jumat,
    pub tarawih: Tarawih,
    pub info: Vec<serde_json::Value>,
    #[serde(rename = "running_text")]
    pub running_text: Vec<String>,
}

fn get_data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }

    Ok(path)
}

#[tauri::command]
fn read_database(app: tauri::AppHandle) -> Result<Database, String> {
    let path = get_data_dir(&app)?.join("database.json");

    if !path.exists() {
        return Err("Database file not found".to_string());
    }

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let db: Database = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    Ok(db)
}

#[tauri::command]
fn save_database(app: tauri::AppHandle, data: Database) -> Result<(), String> {
    let path = get_data_dir(&app)?.join("database.json");
    let content = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_wallpapers(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let path = get_data_dir(&app)?.join("wallpaper");

    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
        return Ok(vec![]);
    }

    let files = fs::read_dir(&path)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            let name = entry.file_name().to_string_lossy().to_lowercase();
            name.ends_with(".jpg") || name.ends_with(".jpeg") || name.ends_with(".png")
        })
        .map(|entry| entry.file_name().to_string_lossy().to_string())
        .collect();

    Ok(files)
}

#[tauri::command]
fn get_logos(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let path = get_data_dir(&app)?.join("logo");

    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
        return Ok(vec![]);
    }

    let files = fs::read_dir(&path)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            let name = entry.file_name().to_string_lossy().to_lowercase();
            name.ends_with(".jpg") || name.ends_with(".jpeg") || name.ends_with(".png")
        })
        .map(|entry| entry.file_name().to_string_lossy().to_string())
        .collect();

    Ok(files)
}

#[tauri::command]
fn get_wallpaper_url(app: tauri::AppHandle, filename: String) -> Result<String, String> {
    let path = get_data_dir(&app)?.join("wallpaper").join(&filename);

    if !path.exists() {
        return Err("File not found".to_string());
    }

    let url = format!("file://{}", path.to_string_lossy());
    Ok(url)
}

#[tauri::command]
fn get_logo_url(app: tauri::AppHandle, filename: String) -> Result<String, String> {
    let path = get_data_dir(&app)?.join("logo").join(&filename);

    if !path.exists() {
        return Err("File not found".to_string());
    }

    let url = format!("file://{}", path.to_string_lossy());
    Ok(url)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_database,
            save_database,
            get_wallpapers,
            get_logos,
            get_wallpaper_url,
            get_logo_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
