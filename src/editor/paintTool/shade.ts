import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class Shade implements PaintTool {
    lastCoords = { x: -1, y: -1 };
    step: PaintStep | null = null;
    pixels: { x: number; y: number }[] = [];
    button = 0;
    factor = 0.1;
    wasDownPressed = false;

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
        this.button = button;
        this.wasDownPressed = true;
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        if (this.wasDownPressed) {
            this.shadeAndSavePixels(layer);

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
            // |AB| = sqrt((ax - bx) ** 2 + (ay - by) ** 2)
            let distance = Math.sqrt(
                (this.lastCoords.x - coords.x) ** 2 +
                    (this.lastCoords.y - coords.y) ** 2,
            );

            if (distance > 0) {
                this.addLinePixels(coords, this.lastCoords, layer);
            }

            this.shadePixels(layer, editor.getCurrentCanvas().getTemplate());

            this.lastCoords = coords;
        }
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

    // shade pixels on the layer
    shadePixels(layer: Layer, template: Layer) {
        let image = layer.getImage();
        let templateImage = template.getImage();

        if (this.button == 0) {
            for (let pixel of this.pixels) {
                let clr = image.getPixel(pixel);
                templateImage.putPixel(pixel, this.darkenColor(clr));
            }
        } else {
            for (let pixel of this.pixels) {
                let clr = image.getPixel(pixel);
                templateImage.putPixel(pixel, this.lightenColor(clr));
            }
        }

        template.setImage(templateImage);
    }

    // shade pixels on the layer and add them to the step
    shadeAndSavePixels(layer: Layer) {
        let image = layer.getImage();

        if (this.button == 0) {
            for (let pixel of this.pixels) {
                let clr = image.getPixel(pixel);
                image.putPixel(pixel, this.darkenColor(clr));

                if (!this.step?.contains(pixel))
                    this.step?.addMiniStep(new PaintMiniStep(pixel, clr));
            }
        } else {
            for (let pixel of this.pixels) {
                let clr = image.getPixel(pixel);
                image.putPixel(pixel, this.lightenColor(clr));

                if (!this.step?.contains(pixel))
                    this.step?.addMiniStep(new PaintMiniStep(pixel, clr));
            }
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
            let contains = false;

            for (let pixel of this.pixels) {
                if (pixel.x == point.x && pixel.y == point.y) {
                    contains = true;
                    break;
                }
            }

            if (!contains) this.pixels.push(point);
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
                let contains = false;

                for (let pixel of this.pixels) {
                    if (pixel.x == point.x && pixel.y == point.y) {
                        contains = true;
                        break;
                    }
                }

                if (!contains) this.pixels.push(point);
            }

            x += incX;
            y += incY;
        }
    }
}
