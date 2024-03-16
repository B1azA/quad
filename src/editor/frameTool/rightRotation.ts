import { FrameTool } from "./frameTool";
import { Editor } from "../editor";
import { Image } from "../canvas/image";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";

export class LeftRotation implements FrameTool {
    use(editor: Editor) {
        let canvas = editor.getCurrentCanvas();
        let layersLength = canvas.getLayersLength();
        let size = canvas.getSize();

        // the space between the width and the height of the canvas
        let space = (size.height - size.width) / 2;

        // get every column and rotate it by 90 degrees
        for (let i = 1; i < layersLength; i++) {
            let currentLayer = canvas.getLayer(i);
            if (currentLayer != null) {
                let step = new PaintStep(currentLayer.getID());
                let imageSave = currentLayer.getImage();
                let imageData = new ImageData(size.width, size.height);
                let image = new Image(imageData);
                let ministeps = [];

                // for every column
                for (let x = 0; x < size.width; x++) {
                    let column = [];
                    // fill the column
                    for (let y = 0 + space; y < size.height - space; y++) {
                        let clr = imageSave.getPixel({ x, y });
                        column.push(clr);
                        ministeps.push(new PaintMiniStep({ x, y }, clr));
                    }

                    // apply the column to the coresponding row
                    for (let x1 = size.width - 1; x1 >= 0; x1--) {
                        let clr = column.pop();

                        if (clr) {
                            let point = {
                                x: x1,
                                y: size.height - 1 - x - space,
                            };
                            image.putPixel(point, clr);
                            let oldClr = imageSave.getPixel(point);
                            ministeps.push(new PaintMiniStep(point, oldClr));
                        }
                    }
                }

                currentLayer.setImage(image);
                step.addMiniSteps(ministeps);
                editor.getCurrentCanvas().steps.addStep(step);
            }
        }
    }
}
