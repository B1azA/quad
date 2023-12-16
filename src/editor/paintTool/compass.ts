import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { MiniStep } from "../steps/steps";

export class Compass implements PaintTool {
    lastCoords = { x: -1, y: -1 };

    onMouseDown(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: number,
    ) {
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

        let ministeps: MiniStep[] = [];
        for (let x = center.x - radius; x <= center.x + radius; x++) {
            for (let y = center.y - radius; y <= center.y + radius; y++) {
                let point = { x, y };
                let distance = Math.sqrt((center.x - point.x) ** 2 + (center.y - point.y) ** 2);

                // add 0.5 so the circle is nicer looking
                if (distance <= radius + 0.5) {
                    if (point.x < size.width && point.x >= 0 && point.y < size.height && point.y >= 0) {
                        let pixel_color = image.getPixel(point);
                        let ministep = new MiniStep(point, pixel_color, layer);
                        ministeps.push(ministep);

                        image.putPixel(point, color);
                    }
                    image.putPixel({ x, y }, color);
                }
            }
        }

        editor.canvas.setImage(image, layer);
        if (layer != 0) {
            editor.steps.addMiniSteps(ministeps);
        }
    }
}
