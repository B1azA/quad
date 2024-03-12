import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class Bucket implements PaintTool {
    step: PaintStep | null = null;

    onMouseDown(
        editor: Editor,
        coords: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
        button: number,
    ) {
        let layerID = layer.getID();
        this.step = new PaintStep(layerID);
        this.fill(coords, color, layer);
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
    ) { }

    // fill neighbours of the same color with a different color
    fill(
        point: { x: number; y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        if (!layer.isTemplate()) {
            let size = layer.getSize();
            let image = layer.getImage();

            let i = 0;
            let fillArray = [point];
            let pixelColor = image.getPixel(point);

            if (
                pixelColor[0] != color[0]
                || pixelColor[1] != color[1]
                || pixelColor[2] != color[2]
                || pixelColor[3] != color[3]
            ) {
                image.putPixel(point, color);
                let paintMinistep = new PaintMiniStep(point, pixelColor);
                this.step?.addMiniStep(paintMinistep);
            }

            while (i < fillArray.length) {
                let left = { x: fillArray[i].x - 1, y: fillArray[i].y };
                let right = { x: fillArray[i].x + 1, y: fillArray[i].y };
                let top = { x: fillArray[i].x, y: fillArray[i].y - 1 };
                let bottom = { x: fillArray[i].x, y: fillArray[i].y + 1 };

                let leftColor = image.getPixel(left);
                let rightColor = image.getPixel(right);
                let topColor = image.getPixel(top);
                let bottomColor = image.getPixel(bottom);

                if (
                    leftColor[0] == pixelColor[0] &&
                    leftColor[1] == pixelColor[1] &&
                    leftColor[2] == pixelColor[2] &&
                    leftColor[3] == pixelColor[3] &&
                    left.x < size.width &&
                    left.x >= 0 &&
                    left.y < size.height &&
                    left.y >= 0
                ) {
                    image.putPixel(left, color);
                    let paintMinistep = new PaintMiniStep(left, pixelColor);
                    this.step?.addMiniStep(paintMinistep);
                    fillArray.push(left);
                }

                if (
                    rightColor[0] == pixelColor[0] &&
                    rightColor[1] == pixelColor[1] &&
                    rightColor[2] == pixelColor[2] &&
                    rightColor[3] == pixelColor[3] &&
                    right.x < size.width &&
                    right.x >= 0 &&
                    right.y < size.height &&
                    right.y >= 0
                ) {
                    image.putPixel(right, color);
                    let paintMinistep = new PaintMiniStep(right, pixelColor);
                    this.step?.addMiniStep(paintMinistep);
                    fillArray.push(right);
                }

                if (
                    topColor[0] == pixelColor[0] &&
                    topColor[1] == pixelColor[1] &&
                    topColor[2] == pixelColor[2] &&
                    topColor[3] == pixelColor[3] &&
                    top.x < size.width &&
                    top.x >= 0 &&
                    top.y < size.height &&
                    top.y >= 0
                ) {
                    image.putPixel(top, color);
                    let paintMinistep = new PaintMiniStep(top, pixelColor);
                    this.step?.addMiniStep(paintMinistep);
                    fillArray.push(top);
                }

                if (
                    bottomColor[0] == pixelColor[0] &&
                    bottomColor[1] == pixelColor[1] &&
                    bottomColor[2] == pixelColor[2] &&
                    bottomColor[3] == pixelColor[3] &&
                    bottom.x < size.width &&
                    bottom.x >= 0 &&
                    bottom.y < size.height &&
                    bottom.y >= 0
                ) {
                    image.putPixel(bottom, color);
                    let paintMinistep = new PaintMiniStep(bottom, pixelColor);
                    this.step?.addMiniStep(paintMinistep);
                    fillArray.push(bottom);
                }

                i += 1;
            }

            layer.setImage(image);
        }
    }
}
