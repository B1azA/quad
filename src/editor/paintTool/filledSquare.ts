import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class FilledSquare implements PaintTool {
    lastCoords = { x: -1, y: -1 };
    step: PaintStep | null = null;

    onMouseDown(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let layerID = layer.getID();
        this.step = new PaintStep(layerID);

        this.lastCoords = coords;
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        // draw line to layer
        this.drawFilledSquare(
            this.lastCoords,
            coords,
            color,
            layer,
        );

        if (this.step != null && !this.step.isEmpty()) {
            editor.getCurrentCanvas().steps.addStep(this.step);
        }
    }

    onMouseMove(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        // draw line to template
        this.drawFilledSquare(
            this.lastCoords,
            coords,
            color,
            editor.getCurrentCanvas().getTemplate(),
        );
    }

    drawFilledSquare(
        center: { x: number, y: number },
        a: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let image = layer.getImage();
        let size = image.size;

        let radius = Math.round(Math.sqrt((center.x - a.x) ** 2 + (center.y - a.y) ** 2));

        for (let x = center.x - radius; x <= center.x + radius; x++) {
            for (let y = center.y - radius; y <= center.y + radius; y++) {
                let point = { x, y };

                if (point.x < size.width && point.x >= 0 && point.y < size.height && point.y >= 0) {
                    let pixelColor = image.getPixel(point);

                    if (!layer.isTemplate()) {
                        let paintMinistep = new PaintMiniStep(point, pixelColor);
                        this.step?.addMiniStep(paintMinistep)
                    }

                    image.putPixel(point, color);
                }
            }
        }

        layer.setImage(image);
    }
}
