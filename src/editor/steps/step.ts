import { Canvas } from "../canvas";

export interface Step {
    // undo and return redo step
    undo(canvas: Canvas): Step | null;
}
