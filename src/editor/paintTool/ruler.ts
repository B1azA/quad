import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";

export class Ruler implements PaintTool {
    lastCoords = { x: -1, y: -1 };
    step: PaintStep | null = null;

    onMouseDown(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: number,
    ) {
        let layerID = editor.canvas.getLayerID(layer);
        this.step = new PaintStep(layerID);

        this.lastCoords = coords;
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: number,
    ) {
        // draw line to layer
        this.drawLine(
            editor,
            coords,
            this.lastCoords,
            color,
            layer,
        );

        if (this.step != null && !this.step.isEmpty()) {
            editor.canvas.steps.addStep(this.step);
        }
    }

    onMouseMove(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: number,
    ) {
        // draw line to template
        this.drawLine(
            editor,
            coords,
            this.lastCoords,
            color,
            0,
        );
    }

    // draw a line from the point a to the point b
    drawLine(
        editor: Editor,
        a: { x: number, y: number },
        b: { x: number, y: number },
        color: [number, number, number, number],
        layer: number,
    ) {
        let size = editor.canvas.getSize();

        // difference
        let dx = b.x - a.x;
        let dy = b.y - a.y;

        // number of steps to take, use bigger step
        let steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);

        // increments
        let xInc = dx / steps;
        let yInc = dy / steps;

        let x = a.x;
        let y = a.y;

        let image = editor.canvas.getImage(layer);

        for (let i = 0; i <= steps; i++) {
            let point = { x: Math.round(x), y: Math.round(y) };

            // paint only if in the canvas
            if (point.x < size.width && point.x >= 0 && point.y < size.height && point.y >= 0) {
                let pixelColor = image.getPixel(point);

                if (layer != 0) {
                    let paintMinistep = new PaintMiniStep(point, pixelColor);
                    this.step?.addMiniStep(paintMinistep)
                }

                image.putPixel(point, color);
            }

            x += xInc;
            y += yInc;

            // break if outside of the canvas
            if ((x >= size.width && y >= size.height) && (x < 0 && y < 0)) {
                break;
            };
        }

        editor.canvas.setImage(image, layer);
    }
}
