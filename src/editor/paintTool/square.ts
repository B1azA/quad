import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { Layer } from "../canvas/layer";

export class Square implements PaintTool {
    lastCoords = { x: -1, y: -1 };

    onMouseDown(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        this.lastCoords = coords;
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        // draw line to layer
        this.drawCircle(
            editor,
            coords,
            this.lastCoords,
            color,
            layer,
        );
    }

    onMouseMove(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        // draw line to template
        this.drawCircle(
            editor,
            coords,
            this.lastCoords,
            color,
            editor.getCurrentCanvas().getTemplate(),
        );
    }

    // draw a line from the point a to the point b
    drawLine(
        editor: Editor,
        a: { x: number, y: number },
        b: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let size = editor.getCurrentCanvas().getSize();
        let isAOnCanvas = a.x >= 0 && a.x < size.width && a.y >= 0 && a.y < size.height;
        let isBOnCanvas = b.x >= 0 && b.x < size.width && b.y >= 0 && b.y < size.height;
        // return if points a and b are both not on the canvas
        if (!isAOnCanvas && !isBOnCanvas) return;

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

            // paint only if in the canvas
            if (point.x < size.width && point.x >= 0 && point.y < size.height && point.y >= 0) {
                let pixel_color = image.getPixel(point);

                image.putPixel(point, color);
            }

            x += xInc;
            y += yInc;

            // break if outside of the canvas
            // if ((x >= size.width && y >= size.height) || (x < 0 && y < 0)) {
            // break;
            // };
        }

        layer.setImage(image);
    }

    drawCircle(
        editor: Editor,
        a: { x: number, y: number },
        b: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let minX = Math.min(a.x, b.x);
        let minY = Math.min(a.y, b.y);
        let maxX = Math.max(a.x, b.x);
        let maxY = Math.max(a.y, b.y);

        let max = Math.min(maxX, maxY);

        let image = layer.getImage();

        let center = {
            x: (minX + minX + max) / 2,
            y: (minY + minY + max) / 2,
        };

        let radius = Math.sqrt(
            (minX - (minX + max)) ** 2
            +
            (minY - (minY + max)) ** 2
        );

        for (let x = minX; x <= max; x++) {
            for (let y = minY; y <= max; y++) {
                let distanceX = center.x - x;
                let distanceY = center.y - y;
                let distanceSquared = distanceX ** 2 + distanceY ** 2;

                if (distanceSquared <= radius) {
                    image.putPixel({ x, y }, color);
                }
            }
        }

        layer.setImage(image);
    }
}
