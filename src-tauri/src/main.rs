// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use image::RgbaImage;

#[derive(serde::Serialize, serde::Deserialize)]
struct ImageMessage {
    width: u32,
    height: u32,
    name: String,
    path: String,
    data: Vec<u8>,
}

#[tauri::command]
fn save_file(image_message: ImageMessage) -> Result<(), String> {
    let image: RgbaImage = match image::ImageBuffer::from_raw(
        image_message.width,
        image_message.height,
        image_message.data,
    ) {
        Some(image) => image,
        None => return Err(format!("Failed to save the file")),
    };

    let file = match rfd::FileDialog::new()
        .set_file_name(&format!("{}.png", &image_message.name))
        .save_file()
    {
        Some(file) => file,
        None => return Err(format!("Failed to save the file")),
    };

    if image.save(file).is_err() {
        return Err(format!("Failed to save the file"));
    }
    Ok(())
}

#[tauri::command]
fn load_file() -> Result<ImageMessage, String> {
    let file = match rfd::FileDialog::new()
        .add_filter("image", &["png", "jpg"])
        .pick_file()
    {
        Some(file) => file,
        None => return Err(format!("Failed to load the file")),
    };

    let path = match file.clone().into_os_string().into_string() {
        Ok(path) => path,
        Err(_) => return Err(format!("Failed to load the file")),
    };

    // std::fs::read(file.unwrap()).unwrap()
    let file_name_str = match file.file_name() {
        Some(name) => name,
        None => return Err(format!("Failed to load the file")),
    }
    .to_str();

    let file_name = match file_name_str {
        Some(str) => str.to_string(),
        None => return Err(format!("Failed to load the file")),
    };

    let image = match image::io::Reader::open(file).unwrap().decode() {
        Ok(image) => image,
        Err(_) => return Err(format!("Failed to load the file")),
    };
    let image_response = ImageMessage {
        width: image.width(),
        height: image.height(),
        name: file_name,
        path: path,
        data: image.to_rgba8().into_raw(),
    };
    Ok(image_response)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file, load_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
