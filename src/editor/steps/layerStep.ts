import { Canvas } from "../canvas/canvas";
import { Image } from "../canvas/image";
import { Layer } from "../canvas/layer";
import { Step } from "./step";


export class LayerRemovedStep implements Step {
    private layer: Layer;
    private index: number;

    constructor(layer: Layer, layerIndex: number) {
        this.layer = layer;
        this.index = layerIndex;
    }

    undo(canvas: Canvas) {
        let redo = new LayerAddedStep(this.layer);
        canvas.addCustomLayerAtIndex(this.layer, this.index);
        return redo;
    }
}

export class LayerAddedStep implements Step {
    private layer: Layer;

    constructor(layer: Layer) {
        this.layer = layer;
    }

    undo(canvas: Canvas) {
        let layerIndex = canvas.getLayerIndexByID(this.layer.getID());
        if (layerIndex != null) {
            let redo = new LayerRemovedStep(this.layer, layerIndex);
            canvas.removeLayer(layerIndex);
            return redo;
        }
        return null;
    }
}

export class LayerMovedDownStep implements Step {
    private index: number;

    constructor(afterMoveIndex: number) {
        this.index = afterMoveIndex;
    }

    undo(canvas: Canvas) {
        canvas.setLayer(this.index);
        canvas.moveLayerUp();
        return new LayerMovedUpStep(this.index - 1);
    }
}

export class LayerMovedUpStep implements Step {
    private index: number;

    constructor(afterMoveIndex: number) {
        this.index = afterMoveIndex;
    }

    undo(canvas: Canvas) {
        canvas.setLayer(this.index);
        canvas.moveLayerDown();
        return new LayerMovedDownStep(this.index + 1);
    }
}
