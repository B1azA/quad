import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class Ruler implements PaintTool {
    lastCoords = { x: -1, y: -1 };
    step: PaintStep | null = null;
    wasDownPressed = false;

    onMouseDown(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
        button: number,
    ) {
        let layerID = layer.getID();
        this.step = new PaintStep(layerID);

        this.lastCoords = coords;
        this.wasDownPressed = true;
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        if (this.wasDownPressed) {
            // draw a line to the layer
            this.drawLine(coords, this.lastCoords, color, layer);

            if (this.step != null && !this.step.isEmpty()) {
                editor.getCurrentCanvas().steps.addStep(this.step);
            }

            this.wasDownPressed = false;
        }
    }

    onMouseMove(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        if (this.wasDownPressed) {
            // draw a line to the template
            this.drawLine(
                coords,
                this.lastCoords,
                color,
                editor.getCurrentCanvas().getTemplate(),
            );
        }
    }

    drawLine(
        a: { x: number; y: number },
        b: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let size = layer.getSize();

        // difference
        let dx = b.x - a.x;
        let dy = b.y - a.y;

        // the number of steps to take, use bigger step
        let steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);

        // increments
        let xInc = dx / steps;
        let yInc = dy / steps;

        let x = a.x;
        let y = a.y;

        let image = layer.getImage();

        for (let i = 0; i <= steps; i++) {
            let point = { x: Math.round(x), y: Math.round(y) };

            // paint only if the point is in the canvas
            if (
                point.x < size.width &&
                point.x >= 0 &&
                point.y < size.height &&
                point.y >= 0
            ) {
                let pixelColor = image.getPixel(point);

                if (!layer.isTemplate()) {
                    let paintMinistep = new PaintMiniStep(point, pixelColor);
                    this.step?.addMiniStep(paintMinistep);
                }

                image.putPixel(point, color);
            }

            x += xInc;
            y += yInc;

            // break if it is outside of the canvas
            if (x >= size.width && y >= size.height && x < 0 && y < 0) {
                break;
            }
        }

        layer.setImage(image);
    }
}
