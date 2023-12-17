import { Image } from "./image";

export class Layer {
    private canvasElement: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private static maxLayerID = 0;
    private template: boolean = false;
    private name: string;

    constructor(
        name: string,
        opacity: number,
        editorContainer: HTMLElement,
        size: { width: number, height: number },
        realSize: { width: number, height: number },
        pos: { x: number, y: number },
        template: boolean,
    ) {
        this.name = name;
        // create a canvas element
        let canvasElement = document.createElement("canvas");

        if (template) {
            // remove template if it exists
            let exists = document.getElementById("editorTemplate");
            if (exists != null) {
                exists.remove();
            }
            canvasElement.id = "editorTemplate";

            this.template = true;
        } else {
            // set id for the steps to recognize the layer
            Layer.maxLayerID += 1;
            canvasElement.id = Layer.maxLayerID.toString();
        }

        canvasElement.className = "editorLayer";

        editorContainer.appendChild(canvasElement);

        // transform the canvas element
        canvasElement.width = size.width;
        canvasElement.height = size.height;

        canvasElement.style.width = realSize.width + "px";
        canvasElement.style.height = realSize.height + "px";

        canvasElement.style.left = pos.x + "px";
        canvasElement.style.top = pos.y + "px";

        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext("2d", { willReadFrequently: true })!;

        this.setOpacity(opacity);
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }

    setSize(size: { width: number, height: number }) {
        this.canvasElement.width = size.width;
        this.canvasElement.height = size.height;
    }

    getSize() {
        return { width: this.canvasElement.width, height: this.canvasElement.height };
    }

    setRealSize(size: { width: number, height: number }) {
        let width = size.width + "px";
        let height = size.height + "px";

        this.canvasElement.style.width = width;
        this.canvasElement.style.height = height;
    }

    getRealSize() {
        return { width: this.canvasElement.clientWidth, height: this.canvasElement.clientHeight };
    }

    setPos(pos: { x: number, y: number }) {
        let x = pos.x + "px";
        let y = pos.y + "px";

        this.canvasElement.style.left = x;
        this.canvasElement.style.top = y;
    }

    getPos() {
        return { x: this.canvasElement.offsetLeft, y: this.canvasElement.offsetTop };
    }

    getBoundingClientRect() {
        return this.canvasElement.getBoundingClientRect();
    }

    getCanvasElement() {
        return this.canvasElement;
    }

    getCtx() {
        return this.ctx;
    }

    getID() {
        return this.canvasElement.id;
    }

    setImage(image: Image) {
        this.ctx.putImageData(image.imageData, 0, 0);
    }

    getImage() {
        let size = this.getSize();
        let imageData = this.ctx.getImageData(0, 0, size.width, size.height);
        let image = new Image(imageData, size);
        return image;
    }

    setImageData(data: Uint8ClampedArray) {
        let image = this.getImage();
        image.imageData.data.set(data);
        this.setImage(image);
    }

    getImageData() {
        return this.getImage().imageData.data;
    }

    isTemplate() {
        return this.template;
    }

    clear() {
        let size = this.getSize();
        this.ctx.clearRect(0, 0, size.width, size.height);
    }

    getOpacity() {
        return Math.round(parseFloat(this.canvasElement.style.opacity) * 100);
    }

    setOpacity(opacity: number) {
        this.canvasElement.style.opacity = (opacity / 100).toString();
    }
}
