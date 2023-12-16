import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";

export class Compass implements PaintTool {
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
        this.drawCircle(
            editor,
            this.lastCoords,
            coords,
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
        this.drawCircle(
            editor,
            this.lastCoords,
            coords,
            color,
            0,
        );
    }

    drawCircle(
        editor: Editor,
        center: { x: number, y: number },
        a: { x: number, y: number },
        color: [number, number, number, number],
        layer: number,
    ) {
        let image = editor.canvas.getImage(layer);
        let size = image.size;

        let radius = Math.round(Math.sqrt((center.x - a.x) ** 2 + (center.y - a.y) ** 2));

        for (let x = center.x - radius; x <= center.x + radius; x++) {
            for (let y = center.y - radius; y <= center.y + radius; y++) {
                let point = { x, y };
                let distance = Math.sqrt((center.x - point.x) ** 2 + (center.y - point.y) ** 2);

                // add 0.5 so the circle is nicer looking
                if (distance <= radius + 0.5) {
                    if (point.x < size.width && point.x >= 0 && point.y < size.height && point.y >= 0) {
                        let pixelColor = image.getPixel(point);

                        if (layer != 0) {
                            let paintMinistep = new PaintMiniStep(point, pixelColor);
                            this.step?.addMiniStep(paintMinistep)
                        }

                        image.putPixel(point, color);
                    }
                }
            }
        }

        editor.canvas.setImage(image, layer);
    }
}
