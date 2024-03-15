import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { Layer } from "../canvas/layer";
import { Pen } from "./pen";

export class Eraser implements PaintTool {
    pen = new Pen();
    // the background color of the editor
    backgroundColor: [number, number, number, number] = [235, 232, 232, 255];

    onMouseDown(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
        button: number,
    ) {
        this.pen.onMouseDown(
            editor,
            coords,
            this.backgroundColor,
            layer,
            button,
        );
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        this.pen.onMouseUp(editor, coords, [0, 0, 0, 0], layer);
    }

    onMouseMove(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        this.pen.onMouseMove(editor, coords, this.backgroundColor, layer);
    }
}
