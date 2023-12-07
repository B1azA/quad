import { Canvas, Image } from "../canvas";

export class MiniStep {
    coords: { x: number, y: number };
    color: [number, number, number, number];
    layer: number;

    constructor(
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: number
    ) {
        this.coords = coords;
        this.color = color;
        this.layer = layer;
    }
}

export class Steps {
    // an array of ministeps is one step
    private steps: MiniStep[][] = [];
    private undoSteps: MiniStep[][] = [];

    clear() {
        this.steps = [];
        this.undoSteps = [];
    }

    newStep() {
        if (this.steps.length == 0) this.steps.push([]);
        if (this.steps[this.steps.length - 1].length != 0) {
            let step: MiniStep[] = [];
            this.steps.push(step);
        }
    }

    addMiniStep(ministep: MiniStep) {
        let index = this.steps.length - 1;
        if (index >= 0) {
            this.steps[this.steps.length - 1].push(ministep);
        }
    }

    addMiniSteps(ministeps: MiniStep[]) {
        let index = this.steps.length - 1;
        if (index >= 0) {
            this.steps[index] = this.steps[index].concat(ministeps);
        }
    }

    undo(canvas: Canvas) {
        let ministeps = this.steps.pop();

        if (ministeps != null) {
            let layerImages: Image[] = [];

            let undoMinisteps = [];

            for (let i = 0; i < canvas.layers.length; i++) {
                layerImages.push(canvas.getImage(i));
            }

            for (let ministep of ministeps) {
                let color = layerImages[ministep.layer].getPixel(ministep.coords);
                let undoMinistep = new MiniStep(ministep.coords, color, ministep.layer);
                undoMinisteps.push(undoMinistep);
                layerImages[ministep.layer].putPixel(ministep.coords, ministep.color);
            }

            for (let i = 0; i < canvas.layers.length; i++) {
                canvas.setImage(layerImages[i], i);
            }

            this.undoSteps.push(undoMinisteps);
        }
    }

    redo(canvas: Canvas) {
        let undoMinisteps = this.undoSteps.pop();

        if (undoMinisteps != null) {
            let layerImages: Image[] = [];

            let ministeps = [];

            for (let i = 0; i < canvas.layers.length; i++) {
                layerImages.push(canvas.getImage(i));
            }

            for (let undoMinistep of undoMinisteps) {
                let color = layerImages[undoMinistep.layer].getPixel(undoMinistep.coords);
                let ministep = new MiniStep(undoMinistep.coords, color, undoMinistep.layer);
                ministeps.push(ministep);
                layerImages[undoMinistep.layer].putPixel(undoMinistep.coords, undoMinistep.color);
            }

            for (let i = 0; i < canvas.layers.length; i++) {
                canvas.setImage(layerImages[i], i);
            }

            this.steps.push(ministeps);
        }
    }
}
