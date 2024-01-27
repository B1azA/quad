import { invoke } from '@tauri-apps/api/tauri';

export type ImageMessage = {
    width: number,
    height: number,
    name: string,
    data: number[],
}

export function fileImportImage(): Promise<ImageMessage> {
    return invoke("file_import_image");
}

export function fileExportImage(imageMessage: ImageMessage): Promise<unknown> {
    return invoke("file_export_image", {
        imageMessage,
    });
}

export type ImagesMessage = {
    width: number,
    height: number,
    name: string,
    data: number[][],
}

export function fileExportImages(imagesMessage: ImagesMessage): Promise<unknown> {
    return invoke("file_export_images", {
        imagesMessage,
    });
}

export type ProjectMessage = {
    name: string,
    width: number,
    height: number,
    frames: FrameMessage[],
    colors: [number, number, number, number][],
    path: string,
}

export type FrameMessage = {
    layers: LayerMessage[],
}

export type LayerMessage = {
    name: string,
    data: number[],
}

export function projectSaveAs(projectMessage: ProjectMessage): Promise<string> {
    return invoke("project_save_as", {
        projectMessage,
    });
}

export function projectSave(projectMessage: ProjectMessage): Promise<unknown> {
    return invoke("project_save", {
        projectMessage,
    });
}

export function projectLoad(): Promise<ProjectMessage> {
    return invoke("project_load");
}
