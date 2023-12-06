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
    steps: MiniStep[][] = [];

    newStep() {
        if (this.steps.length == 0) this.steps.push([]);
        if (this.steps[this.steps.length - 1].length != 0) {
            let step: MiniStep[] = [];
            this.steps.push(step);
        }
    }

    addMiniStep(ministep: MiniStep) {
        this.steps[this.steps.length - 1].push(ministep);
    }

    addMiniSteps(ministeps: MiniStep[]) {
        let index = this.steps.length - 1;
        this.steps[index] = this.steps[index].concat(ministeps);
    }

    undo(canvas: Canvas) {
        // pop two times to remove empty steps
        let ministeps = this.steps.pop();

        if (ministeps != null) {
            let layerImages: Image[] = [];

            for (let i = 0; i < canvas.layers.length; i++) {
                layerImages.push(canvas.getImage(i));
            }

            for (let ministep of ministeps) {
                layerImages[ministep.layer].putPixel(ministep.coords, ministep.color);
            }

            for (let i = 0; i < canvas.layers.length; i++) {
                canvas.setImage(layerImages[i], i);
            }
        }
    }
}
