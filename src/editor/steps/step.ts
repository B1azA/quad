import { Canvas } from "../canvas/canvas";

export interface Step {
    // undo and return a redo step
    undo(canvas: Canvas): Step | null;
}
