import { Canvas } from "../canvas/canvas";

export interface Step {
    /** Undo and return a redo step. */
    undo(canvas: Canvas): Step | null;
}
