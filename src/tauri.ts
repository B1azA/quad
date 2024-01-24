import { invoke } from '@tauri-apps/api/tauri';

export type ExportMessage = {
    width: number,
    height: number,
    name: string,
    data: number[],
}

export function fileImport(): Promise<ExportMessage> {
    return invoke("file_import");
}

export function fileExport(exportMessage: ExportMessage) {
    invoke("file_export", {
        exportMessage,
    })
        .then(() => console.log("ok"))
        .catch((error) => console.error(error));
}

export type ProjectMessage = {
    name: string,
    width: number,
    height: number,
    frames: FrameMessage[],
    colors: [number, number, number, number][],
}

export type FrameMessage = {
    layers: LayerMessage[],
}

export type LayerMessage = {
    name: string,
    data: number[],
}

export function projectSave(projectMessage: ProjectMessage) {
    invoke("project_save", {
        projectMessage,
    })
        .then()
        .catch((error) => console.error(error));
}

export function projectLoad(): Promise<ProjectMessage> {
    return invoke("project_load");
}
