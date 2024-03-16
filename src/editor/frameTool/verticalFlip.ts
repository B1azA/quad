import { FrameTool } from "./frameTool";
import { Editor } from "../editor";
import { Image } from "../canvas/image";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";

export class VerticalFlip implements FrameTool {
    use(editor: Editor) {
        let canvas = editor.getCurrentCanvas();
        let layersLength = canvas.getLayersLength();
        let size = canvas.getSize();

        // get the rows at the top half and set them to the bottom half and vice versa
        for (let i = 1; i < layersLength; i++) {
            let currentLayer = canvas.getLayer(i);
            if (currentLayer != null) {
                let step = new PaintStep(currentLayer.getID());
                let imageSave = currentLayer.getImage();
                let imageData = new ImageData(size.width, size.height);
                let image = new Image(imageData);

                for (let x = 0; x < size.width; x++) {
                    for (let y = 0; y < size.height; y++) {
                        let point = { x, y };
                        let newPoint = { x: size.width - 1 - x, y };
                        let clr = imageSave.getPixel(point);

                        if (clr[3] != 0) {
                            image.putPixel(newPoint, clr);
                            let ministeps = [
                                new PaintMiniStep(point, clr),
                                new PaintMiniStep(
                                    newPoint,
                                    imageSave.getPixel(newPoint),
                                ),
                            ];
                            step.addMiniSteps(ministeps);
                        }
                    }
                }

                currentLayer.setImage(image);
                editor.getCurrentCanvas().steps.addStep(step);
            }
        }
    }
}
