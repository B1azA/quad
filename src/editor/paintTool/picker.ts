import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { Layer } from "../canvas/layer";

export class Picker implements PaintTool {

    onMouseDown(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
        button: number,
    ) {
        let image = layer.getImage();
        let clr = image.getPixel(coords);
        if (button == 0) {
            editor.palette.setPrimaryColor(clr);
        } else if (button == 2) {
            editor.palette.setSecondaryColor(clr);
        }
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
    }

    onMouseMove(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
    }
}
