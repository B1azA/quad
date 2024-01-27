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
