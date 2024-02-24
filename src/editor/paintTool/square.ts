import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class Square implements PaintTool {
    lastCoords = { x: -1, y: -1 };
    step: PaintStep | null = null;

    onMouseDown(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
        button: number,
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
        this.drawSquare(
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
        this.drawSquare(
            this.lastCoords,
            coords,
            color,
            editor.getCurrentCanvas().getTemplate(),
        );
    }

    drawSquare(
        center: { x: number, y: number },
        a: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let image = layer.getImage();
        let size = image.size;

        let radius = Math.round(Math.sqrt((center.x - a.x) ** 2 + (center.y - a.y) ** 2));

        if (center.x == a.x && center.y == a.y) {
            let pixelColor = image.getPixel(a);

            if (!layer.isTemplate()) {
                let paintMinistep = new PaintMiniStep(a, pixelColor);
                this.step?.addMiniStep(paintMinistep)
            }

            image.putPixel(a, color);
        } else {
            for (let x = center.x - radius + 1; x <= center.x + radius - 1; x++) {
                let point1 = { x, y: center.y - radius };

                if (point1.x < size.width && point1.x >= 0 && point1.y < size.height && point1.y >= 0) {
                    let pixelColor = image.getPixel(point1);

                    if (!layer.isTemplate()) {
                        let paintMinistep = new PaintMiniStep(point1, pixelColor);
                        this.step?.addMiniStep(paintMinistep)
                    }

                    image.putPixel(point1, color);
                }

                let point2 = { x, y: center.y + radius };

                if (point2.x < size.width && point2.x >= 0 && point2.y < size.height && point2.y >= 0) {
                    let pixelColor = image.getPixel(point2);

                    if (!layer.isTemplate()) {
                        let paintMinistep = new PaintMiniStep(point2, pixelColor);
                        this.step?.addMiniStep(paintMinistep)
                    }

                    image.putPixel(point2, color);
                }
            }

            for (let y = center.y - radius; y <= center.y + radius; y++) {
                let point1 = { x: center.x - radius, y };

                if (point1.x < size.width && point1.x >= 0 && point1.y < size.height && point1.y >= 0) {
                    let pixelColor = image.getPixel(point1);

                    if (!layer.isTemplate()) {
                        let paintMinistep = new PaintMiniStep(point1, pixelColor);
                        this.step?.addMiniStep(paintMinistep)
                    }

                    image.putPixel(point1, color);
                }

                let point2 = { x: center.x + radius, y };

                if (point2.x < size.width && point2.x >= 0 && point2.y < size.height && point2.y >= 0) {
                    let pixelColor = image.getPixel(point2);

                    if (!layer.isTemplate()) {
                        let paintMinistep = new PaintMiniStep(point2, pixelColor);
                        this.step?.addMiniStep(paintMinistep)
                    }

                    image.putPixel(point2, color);
                }
            }
        }

        layer.setImage(image);
    }
}
