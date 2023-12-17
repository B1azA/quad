import { Canvas } from "../canvas/canvas";
import { Image } from "../canvas/image";
import { Step } from "./step";


export class LayerRemovedStep implements Step {
    private image: Image;
    private name: string;
    private opacity: number;

    constructor(layerName: string, layerOpacity: number, layerImage: Image) {
        this.image = layerImage;
        this.name = layerName;
        this.opacity = layerOpacity;
    }

    undo(canvas: Canvas) {

        return this;
    }
}
