import { Canvas, Image } from "../canvas";
import { Step } from "./step";

export class Steps {
    private undoSteps: Step[] = [];
    private redoSteps: Step[] = [];

    addStep(step: Step) {
        this.undoSteps.push(step);
    }

    undoStep(canvas: Canvas) {
        let step = this.undoSteps.pop();
        if (step != null) {
            let redoStep = step.undo(canvas);
            if (redoStep != null)
                this.redoSteps.push(redoStep);
        }
    }

    redoStep(canvas: Canvas) {
        let redoStep = this.redoSteps.pop();
        if (redoStep != null) {
            let undoStep = redoStep.undo(canvas);
            if (undoStep != null)
                this.undoSteps.push(undoStep);
        }
    }

    clear() {
        this.undoSteps = [];
        this.redoSteps = [];
    }
}
