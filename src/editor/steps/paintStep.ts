import { Canvas } from "../canvas";
import { Step } from "./step";

export class PaintMiniStep {
    coords: { x: number, y: number };
    color: [number, number, number, number];

    constructor(
        coords: { x: number, y: number },
        color: [number, number, number, number],
    ) {
        this.coords = coords;
        this.color = color;
    }
}

export class PaintStep implements Step {
    private ministeps: PaintMiniStep[] = [];
    private layerID: string;

    constructor(layerID: string) {
        this.layerID = layerID;
    }

    addMiniStep(ministep: PaintMiniStep) {
        this.ministeps.push(ministep);
    }

    addMiniSteps(ministeps: PaintMiniStep[]) {
        this.ministeps = this.ministeps.concat(ministeps);
    }

    isEmpty() {
        return this.ministeps.length == 0;
    }

    contains(coords: { x: number, y: number }) {
        for (let ministep of this.ministeps) {
            if (ministep.coords.x == coords.x && ministep.coords.y == coords.y) {
                return true;
            }
        }

        return false;
    }

    undo(canvas: Canvas) {
        let layer = canvas.getLayerByID(this.layerID);
        if (layer != null) {
            let image = canvas.getImage(layer);
            let redoStep = new PaintStep(this.layerID);

            for (let ministep of this.ministeps) {
                let color = image.getPixel(ministep.coords);
                redoStep.addMiniStep(new PaintMiniStep(ministep.coords, color));
                image.putPixel(ministep.coords, ministep.color);
            }

            canvas.setImage(image, layer);
            canvas.setLayer(layer);

            return redoStep;
        }

        return null;
    }
}
