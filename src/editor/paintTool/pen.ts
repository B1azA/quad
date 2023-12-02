import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { Steps, MiniStep } from "./steps";

export class Pen implements PaintTool {
    lastCoords = { x: -1, y: -1 };

    onMouseDown(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: number,
    ) {
        this.drawPixel(editor, coords, color, layer);
        this.lastCoords = coords;
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: number,
    ) {
        // nothing, paints when moving
    }

    onMouseMove(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: number
    ) {
        // |AB| = sqrt((ax - bx) ** 2 + (ay - by) ** 2)
        let distance = Math.sqrt(
            (this.lastCoords.x - coords.x) ** 2
            +
            (this.lastCoords.y - coords.y) ** 2
        );

        if (distance > 0) {
            this.drawLine(
                editor,
                coords,
                this.lastCoords,
                color,
                layer,
            );
        }

        this.lastCoords = coords;
    }

    // draw a pixel at the point with the selected color
    drawPixel(
        editor: Editor,
        point: { x: number, y: number },
        color: [number, number, number, number],
        layer: number,
    ) {
        // return if outside of canvas
        let size = editor.canvas.getSize();
        if (point.x >= size.width || point.x < 0 || point.y >= size.height || point.y < 0) return;

        let image = editor.canvas.getImage(layer);

        if (layer != 0) {
            let pixel_color = image.getPixel(point);
            let ministep = new MiniStep(point, pixel_color, layer);
            editor.steps.addMiniStep(ministep);
        }

        image.putPixel(point, color);

        editor.canvas.setImage(image, layer);
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

        let ministeps: MiniStep[] = [];

        for (let i = 0; i <= steps; i++) {
            let point = { x: Math.round(x), y: Math.round(y) };

            // check if this step is already in the steps
            let exists = false;
            let index = editor.steps.steps.length - 1;
            if (index >= 0) {
                for (let ministep of editor.steps.steps[index]) {
                    if (ministep.coords.x == point.x && ministep.coords.y == point.y) {
                        exists = true;
                        break;
                    }
                }
            }

            // paint only if in the canvas and the step is not already in the steps
            if (point.x < size.width && point.x >= 0 && point.y < size.height && point.y >= 0 && !exists) {
                let pixel_color = image.getPixel(point);
                let ministep = new MiniStep(point, pixel_color, layer);
                ministeps.push(ministep);

                image.putPixel(point, color);
            }

            x += xInc;
            y += yInc;
        }

        editor.canvas.setImage(image, layer);

        if (layer != 0) {
            editor.steps.addMiniSteps(ministeps);
        }
    }
}