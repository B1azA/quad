import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class RectangleEraser implements PaintTool {
    lastCoords = { x: -1, y: -1 };
    step: PaintStep | null = null;
    selected = false;
    selectedRegion = { x1: 0, y1: 0, x2: 0, y2: 0 };
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
            let ministeps = [];
            let image = layer.getImage();
            for (
                let x = 0;
                x <= this.selectedRegion.x2 - this.selectedRegion.x1;
                x++
            ) {
                for (
                    let y = 0;
                    y <= this.selectedRegion.y2 - this.selectedRegion.y1;
                    y++
                ) {
                    let point = {
                        x: x + this.selectedRegion.x1,
                        y: y + this.selectedRegion.y1,
                    };
                    let stepColor = image.getPixel(point);
                    image.putPixel(point, [0, 0, 0, 0]);

                    ministeps.push(new PaintMiniStep(point, stepColor));
                }
            }

            this.step?.addMiniSteps(ministeps);
            if (this.step != null)
                editor.getCurrentCanvas().steps.addStep(this.step);
            layer.setImage(image);
            editor.getCurrentCanvas().getTemplate().clear();

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
            this.selectedRegion = this.drawBorder(
                this.lastCoords,
                coords,
                editor.tools.getSelectColor(),
                editor.getCurrentCanvas().getTemplate(),
            );
        }
    }

    drawBorder(
        a: { x: number; y: number },
        b: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let image = layer.getImage();
        let size = image.size;

        let a2 = { x: 0, y: 0 };
        let b2 = { x: 0, y: 0 };

        a2.x = Math.min(a.x, b.x);
        a2.y = Math.min(a.y, b.y);
        b2.x = Math.max(a.x, b.x);
        b2.y = Math.max(a.y, b.y);

        a2.x = a2.x < 0 ? -1 : a2.x;
        a2.x = a2.x > size.width ? size.width : a2.x;
        a2.y = a2.y < 0 ? -1 : a2.y;
        a2.y = a2.y > size.height ? size.height : a2.y;

        b2.x = b2.x < 0 ? -1 : b2.x;
        b2.x = b2.x > size.width ? size.width : b2.x;
        b2.y = b2.y < 0 ? -1 : b2.y;
        b2.y = b2.y > size.height ? size.height : b2.y;

        for (let x = a2.x; x <= b2.x; x++) {
            if (x % 2 == 0) {
                let point1 = { x: x, y: a2.y };
                let point2 = { x: x, y: b2.y };
                image.putPixel(point1, color);
                image.putPixel(point2, color);
            }
        }

        for (let y = a2.y; y <= b2.y; y++) {
            if (y % 2 == 0) {
                let point1 = { x: a2.x, y: y };
                let point2 = { x: b2.x, y: y };
                image.putPixel(point1, color);
                image.putPixel(point2, color);
            }
        }

        layer.setImage(image);

        return {
            x1: a2.x + 1,
            y1: a2.y + 1,
            x2: b2.x - 1,
            y2: b2.y - 1,
        };
    }
}
