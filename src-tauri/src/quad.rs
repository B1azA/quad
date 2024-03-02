use image::RgbaImage;
use std::{fs, io::Write, path::Path};

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ImageMessage {
    width: u32,
    height: u32,
    name: String,
    data: Vec<u8>,
}

#[tauri::command]
pub fn file_export_image(image_message: ImageMessage) -> Result<(), String> {
    let image: RgbaImage = match image::ImageBuffer::from_raw(
        image_message.width,
        image_message.height,
        image_message.data,
    ) {
        Some(image) => image,
        None => return Err(String::from("Failed to export the file")),
    };

    let home = if let Some(home) = home::home_dir() {
        home
    } else {
        return Err(String::from("Failed to fin the home directory"));
    };

    let file = match rfd::FileDialog::new()
        .set_directory(home)
        .set_file_name(&format!("{}", &image_message.name))
        .add_filter("Image", &["png"])
        .save_file()
    {
        Some(file) => file,
        None => return Err(String::from("Failed to export the file")),
    };

    if image.save(file).is_err() {
        return Err(String::from("Failed to export the file"));
    }
    Ok(())
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ImagesMessage {
    width: u32,
    height: u32,
    name: String,
    data: Vec<Vec<u8>>,
}

#[tauri::command]
pub fn file_export_images(images_message: ImagesMessage) -> Result<(), String> {
    let mut images = vec![];

    for data in images_message.data {
        let image: RgbaImage =
            match image::ImageBuffer::from_raw(images_message.width, images_message.height, data) {
                Some(image) => image,
                None => return Err(String::from("Failed to export the file")),
            };
        images.push(image);
    }

    let home = if let Some(home) = home::home_dir() {
        home
    } else {
        return Err(String::from("Failed to fin the home directory"));
    };

    let folder = match rfd::FileDialog::new()
        .set_directory(home)
        .set_file_name(&images_message.name)
        .pick_folder()
    {
        Some(folder) => folder,
        None => return Err(String::from("Failed to export the file")),
    };

    let folder_string = folder.to_string_lossy().as_ref().to_string();

    for (i, image) in images.iter().enumerate() {
        let path_string = format!("{}/{}-{}.png", folder_string, images_message.name, i);
        let path = Path::new(&path_string);

        if image.save(path).is_err() {
            return Err(String::from("Failed to export the file"));
        }
    }

    Ok(())
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ImagesMessageGif {
    width: u32,
    height: u32,
    name: String,
    data: Vec<Vec<u8>>,
    fps: u32,
}

#[tauri::command]
pub fn file_export_images_as_gif(images_message: ImagesMessageGif) -> Result<(), String> {
    let mut images = vec![];

    for data in images_message.data {
        let image: RgbaImage =
            match image::ImageBuffer::from_raw(images_message.width, images_message.height, data) {
                Some(image) => image,
                None => return Err(String::from("Failed to export the file")),
            };
        images.push(image);
    }

    let home = if let Some(home) = home::home_dir() {
        home
    } else {
        return Err(String::from("Failed to fin the home directory"));
    };

    let file_path = match rfd::FileDialog::new()
        .set_directory(home)
        .set_file_name(&format!("{}.gif", &images_message.name))
        .save_file()
    {
        Some(file) => file,
        None => return Err(String::from("Failed to export the file")),
    };

    let file = match std::fs::File::create(file_path.clone()) {
        Ok(file) => file,
        Err(error) => {
            return Err(format!("Error: {}", error));
        }
    };

    let mut encoder = image::codecs::gif::GifEncoder::new(file);
    if let Err(error) = encoder.set_repeat(image::codecs::gif::Repeat::Infinite) {
        return Err(format!("Error: {}", error));
    }

    let mut frames = vec![];
    let frame_delay = (1.0 / images_message.fps as f64 * 1000.0) as u32;

    for image in images.drain(0..images.len()) {
        let frame = image::Frame::from_parts(
            image,
            0,
            0,
            image::Delay::from_numer_denom_ms(frame_delay, 1),
        );
        frames.push(frame);
    }

    if let Err(error) = encoder.encode_frames(frames) {
        return Err(format!("Error: {}", error));
    }

    Ok(())
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ImageSize {
    width: u32,
    height: u32,
}

#[tauri::command]
pub fn file_import_image(image_size: ImageSize) -> Result<ImageMessage, String> {
    let home = if let Some(home) = home::home_dir() {
        home
    } else {
        return Err(String::from("Failed to fin the home directory"));
    };

    let file = match rfd::FileDialog::new()
        .set_directory(home)
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

    let image = image.resize_exact(
        image_size.width,
        image_size.height,
        image::imageops::FilterType::Nearest,
    );

    let export_response = ImageMessage {
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
    path: String,
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
pub fn project_save_as(mut project_message: ProjectMessage) -> Result<String, String> {
    let home = if let Some(home) = home::home_dir() {
        home
    } else {
        return Err(String::from("Failed to fin the home directory"));
    };

    let file_path = match rfd::FileDialog::new()
        .set_directory(home)
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

    let path_string = file_path.to_string_lossy().as_ref().to_string();

    Ok(path_string)
}

#[tauri::command]
pub fn project_save(mut project_message: ProjectMessage) -> Result<(), String> {
    let file_path = Path::new(&project_message.path);

    let mut file = match std::fs::File::create(file_path) {
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
    let home = if let Some(home) = home::home_dir() {
        home
    } else {
        return Err(String::from("Failed to fin the home directory"));
    };

    let file_path = match rfd::FileDialog::new()
        .set_directory(home)
        .add_filter("QUAD", &["quad"])
        .pick_file()
    {
        Some(file) => file,
        None => return Err(String::from("Failed to load the file")),
    };

    let bytes = match fs::read(file_path.clone()) {
        Ok(bytes) => bytes,
        Err(error) => {
            return Err(format!("Error2: {}", error));
        }
    };

    let mut deserialized: ProjectMessage = match bincode::deserialize(&bytes) {
        Ok(des) => des,
        Err(error) => {
            return Err(format!("Error3: {}", error));
        }
    };

    // set the path of the project
    deserialized.path = file_path.to_string_lossy().as_ref().to_string();

    Ok(deserialized)
}
