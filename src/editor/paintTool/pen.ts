import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class Pen implements PaintTool {
    lastCoords = { x: -1, y: -1 };
    step: PaintStep | null = null;
    pixels: { x: number; y: number }[] = [];

    onMouseDown(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
        button: number,
    ) {
        this.pixels = [];
        let layerID = layer.getID();
        this.step = new PaintStep(layerID);

        this.addPixel(coords, layer);
        this.lastCoords = coords;
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        this.drawAndSavePixels(color, layer);

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
            this.addLinePixels(coords, this.lastCoords, layer);
        }

        this.drawPixels(color, editor.getCurrentCanvas().getTemplate());

        this.lastCoords = coords;
    }

    // draw pixels to the layer
    drawPixels(color: [number, number, number, number], layer: Layer) {
        let image = layer.getImage();

        for (let pixel of this.pixels) {
            image.putPixel(pixel, color);
        }

        layer.setImage(image);
    }

    // draw pixels to the layer and add them to the step
    drawAndSavePixels(color: [number, number, number, number], layer: Layer) {
        let image = layer.getImage();

        for (let pixel of this.pixels) {
            let stepColor = image.getPixel(pixel);
            image.putPixel(pixel, color);
            if (!this.step?.contains(pixel))
                this.step?.addMiniStep(new PaintMiniStep(pixel, stepColor));
        }

        layer.setImage(image);
    }

    // add a pixel to the pixels array
    addPixel(point: { x: number; y: number }, layer: Layer) {
        let size = layer.getSize();
        if (
            point.x < size.width &&
            point.x >= 0 &&
            point.y < size.height &&
            point.y >= 0
        ) {
            this.pixels.push(point);
        }
    }

    // add pixels in a line to the pixels array
    addLinePixels(
        a: { x: number; y: number },
        b: { x: number; y: number },
        layer: Layer,
    ) {
        let size = layer.getSize();

        // difference
        let dx = b.x - a.x;
        let dy = b.y - a.y;

        // number of steps to take, use bigger step
        let steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);

        // increments
        let incX = dx / steps;
        let incY = dy / steps;

        let x = a.x;
        let y = a.y;

        for (let i = 0; i <= steps; i++) {
            let point = { x: Math.round(x), y: Math.round(y) };

            // add only if in the canvas and the step is not already in the steps
            if (
                point.x < size.width &&
                point.x >= 0 &&
                point.y < size.height &&
                point.y >= 0
            ) {
                this.pixels.push(point);
            }

            x += incX;
            y += incY;
        }
    }
}
