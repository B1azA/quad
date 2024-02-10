// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod quad;

fn main() {
    // create_zip();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            quad::file_export_image,
            quad::file_export_images,
            quad::file_export_images_as_gif,
            quad::file_import_image,
            quad::project_save_as,
            quad::project_save,
            quad::project_load,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
