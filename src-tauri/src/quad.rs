use std::{fs, io::Write};

use image::RgbaImage;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ExportMessage {
    width: u32,
    height: u32,
    name: String,
    data: Vec<u8>,
}

#[tauri::command]
pub fn file_export(export_message: ExportMessage) -> Result<(), String> {
    let image: RgbaImage = match image::ImageBuffer::from_raw(
        export_message.width,
        export_message.height,
        export_message.data,
    ) {
        Some(image) => image,
        None => return Err(String::from("Failed to save the file")),
    };

    let file = match rfd::FileDialog::new()
        .set_file_name(&format!("{}.png", &export_message.name))
        .save_file()
    {
        Some(file) => file,
        None => return Err(String::from("Failed to save the file")),
    };

    if image.save(file).is_err() {
        return Err(String::from("Failed to save the file"));
    }
    Ok(())
}

#[tauri::command]
pub fn file_import() -> Result<ExportMessage, String> {
    let file = match rfd::FileDialog::new()
        .add_filter("Image", &["png", "jpg"])
        .pick_file()
    {
        Some(file) => file,
        None => return Err(String::from("Failed to load the file")),
    };

    // std::fs::read(file.unwrap()).unwrap()
    let file_name_str = match file.file_name() {
        Some(name) => name,
        None => return Err(String::from("Failed to load the file")),
    }
    .to_str();

    let file_name = match file_name_str {
        Some(str) => str.to_string(),
        None => return Err(String::from("Failed to load the file")),
    };

    let image = match image::io::Reader::open(file).unwrap().decode() {
        Ok(image) => image,
        Err(_) => return Err(String::from("Failed to load the file")),
    };
    let export_response = ExportMessage {
        width: image.width(),
        height: image.height(),
        name: file_name,
        data: image.to_rgba8().into_raw(),
    };
    Ok(export_response)
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ProjectMessage {
    name: String,
    width: u32,
    height: u32,
    frames: Vec<FrameMessage>,
    colors: Vec<Vec<u32>>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct FrameMessage {
    layers: Vec<LayerMessage>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct LayerMessage {
    name: String,
    data: Vec<u8>,
}

#[tauri::command]
pub fn project_save(mut project_message: ProjectMessage) -> Result<(), String> {
    let file_path = match rfd::FileDialog::new()
        .set_file_name(&format!("{}.quad", &project_message.name))
        .save_file()
    {
        Some(file) => file,
        None => return Err(String::from("Failed to save the project")),
    };

    let mut file = match std::fs::File::create(file_path.clone()) {
        Ok(file) => file,
        Err(error) => {
            return Err(format!("Error: {}", error));
        }
    };

    // set the project name to the file name
    if let Some(name) = file_path.file_name() {
        if let Some(nm) = name.to_str() {
            let mut name = nm.to_string();
            let _ = name.split_off(name.len() - 5);
            project_message.name = name;
        }
    }

    let serialized = match bincode::serialize(&project_message) {
        Ok(ser) => ser,
        Err(error) => {
            return Err(format!("Error: {}", error));
        }
    };
    match file.write_all(&serialized) {
        Ok(_) => {}
        Err(error) => {
            return Err(format!("Error: {}", error));
        }
    };

    Ok(())
}

#[tauri::command]
pub fn project_load() -> Result<ProjectMessage, String> {
    let file_path = match rfd::FileDialog::new()
        .add_filter("QUAD", &["quad"])
        .pick_file()
    {
        Some(file) => file,
        None => return Err(String::from("Failed to load the file")),
    };

    let bytes = match fs::read(file_path) {
        Ok(bytes) => bytes,
        Err(error) => {
            return Err(format!("Error2: {}", error));
        }
    };

    let deserialized: ProjectMessage = match bincode::deserialize(&bytes) {
        Ok(des) => des,
        Err(error) => {
            return Err(format!("Error3: {}", error));
        }
    };

    Ok(deserialized)
}
