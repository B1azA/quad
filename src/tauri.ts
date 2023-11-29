import { invoke } from '@tauri-apps/api/tauri';
import { Editor } from './editor';

export type ImageMessage = {
    width: number,
    height: number,
    name: string,
    data: number[],
}

export function loadFile(): Promise<ImageMessage> {
    return invoke("load_file")
}

export function saveFile(imageMessage: ImageMessage) {
    invoke("save_file", {
        imageMessage,
    })
        .then((message) => console.log("ok"))
        .catch((error) => console.error(error));
}