import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class Shade implements PaintTool {
    lastCoords = { x: -1, y: -1 };
    step: PaintStep | null = null;
    button = 0;
    factor = 0.1;

    onMouseDown(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
        button: number,
    ) {
        let layerID = layer.getID();
        this.step = new PaintStep(layerID);

        this.shadePixel(coords, layer);
        this.lastCoords = coords;

        this.button = button;
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        if (this.step != null && !this.step.isEmpty()) {
            editor.getCurrentCanvas().steps.addStep(this.step);
        }
    }

    onMouseMove(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        // |AB| = sqrt((ax - bx) ** 2 + (ay - by) ** 2)
        let distance = Math.sqrt(
            (this.lastCoords.x - coords.x) ** 2 +
                (this.lastCoords.y - coords.y) ** 2,
        );

        if (distance > 0) {
            this.shadeLine(coords, this.lastCoords, color, layer);
        }

        this.lastCoords = coords;
    }

    darkenColor(color: [number, number, number, number]) {
        if (color[0] == 0 && color[1] == 0 && color[2] == 0 && color[3] == 0) {
            return color;
        } else {
            let newColor: [number, number, number, number] = [0, 0, 0, 255];

            newColor[0] = color[0] * (1 - this.factor);
            newColor[1] = color[1] * (1 - this.factor);
            newColor[2] = color[2] * (1 - this.factor);
            return newColor;
        }
    }

    lightenColor(color: [number, number, number, number]) {
        if (color[0] == 0 && color[1] == 0 && color[2] == 0 && color[3] == 0) {
            return color;
        } else {
            let newColor: [number, number, number, number] = [0, 0, 0, 255];

            newColor[0] = color[0] + (255 - color[0]) * this.factor;
            newColor[1] = color[1] + (255 - color[1]) * this.factor;
            newColor[2] = color[2] + (255 - color[2]) * this.factor;
            return newColor;
        }
    }

    // draw a pixel at the point with the selected color
    shadePixel(point: { x: number; y: number }, layer: Layer) {
        let image = layer.getImage();
        let size = layer.getSize();
        if (
            point.x < size.width &&
            point.x >= 0 &&
            point.y < size.height &&
            point.y >= 0 &&
            !layer.isTemplate()
        ) {
            let pixelColor = image.getPixel(point);

            let paintMinistep = new PaintMiniStep(point, pixelColor);
            this.step?.addMiniStep(paintMinistep);

            if (this.button == 0)
                image.putPixel(point, this.darkenColor(pixelColor));
            else if (this.button == 2)
                image.putPixel(point, this.lightenColor(pixelColor));
        }

        layer.setImage(image);
    }

    // draw a line from the point a to the point b
    shadeLine(
        a: { x: number; y: number },
        b: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let size = layer.getSize();

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

        let image = layer.getImage();

        for (let i = 0; i <= steps; i++) {
            let point = { x: Math.round(x), y: Math.round(y) };

            // check if this step already exists
            let exists = this.step?.contains(point);

            // paint only if in the canvas and the step is not already in the steps
            if (
                point.x < size.width &&
                point.x >= 0 &&
                point.y < size.height &&
                point.y >= 0 &&
                !exists
            ) {
                let pixelColor = image.getPixel(point);

                if (!layer.isTemplate()) {
                    let paintMinistep = new PaintMiniStep(point, pixelColor);
                    this.step?.addMiniStep(paintMinistep);
                }

                if (this.button == 0)
                    image.putPixel(point, this.darkenColor(pixelColor));
                else if (this.button == 2)
                    image.putPixel(point, this.lightenColor(pixelColor));
            }

            x += xInc;
            y += yInc;
        }

        layer.setImage(image);
    }
}
