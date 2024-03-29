import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class Compass implements PaintTool {
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
            this.drawCircle(this.lastCoords, coords, color, layer);

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
            this.drawCircle(
                this.lastCoords,
                coords,
                color,
                editor.getCurrentCanvas().getTemplate(),
            );
        }
    }

    drawCircle(
        center: { x: number; y: number },
        a: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let image = layer.getImage();
        let size = image.size;

        // calculate circle's radius
        let radius = Math.round(
            Math.sqrt((center.x - a.x) ** 2 + (center.y - a.y) ** 2),
        );

        // check for every pixel in square if it's within the radius
        for (let x = center.x - radius; x <= center.x + radius; x++) {
            for (let y = center.y - radius; y <= center.y + radius; y++) {
                let point = { x, y };
                let distance = Math.sqrt(
                    (center.x - point.x) ** 2 + (center.y - point.y) ** 2,
                );

                // add 0.5 so the circle is nicer looking
                if (distance <= radius + 0.5 && distance > radius - 0.5) {
                    if (
                        point.x < size.width &&
                        point.x >= 0 &&
                        point.y < size.height &&
                        point.y >= 0
                    ) {
                        let pixelColor = image.getPixel(point);

                        if (!layer.isTemplate()) {
                            let paintMinistep = new PaintMiniStep(
                                point,
                                pixelColor,
                            );
                            this.step?.addMiniStep(paintMinistep);
                        }

                        image.putPixel(point, color);
                    }
                }
            }
        }

        layer.setImage(image);
    }
}
