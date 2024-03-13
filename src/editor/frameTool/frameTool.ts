import { Editor } from "../editor";

export interface FrameTool {
    use(editor: Editor): void;
}
