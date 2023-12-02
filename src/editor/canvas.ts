export class Canvas {
    private layers: HTMLCanvasElement[];
    private ctxs: CanvasRenderingContext2D[];
    private editorContainer = document.getElementById("editorContainer")!;

    // original width and height of the canvas
    private originalRealWidth: number;
    private originalRealHeight: number;

    private zoom: number = 1;

    currentColor: [number, number, number, number] = [0, 0, 0, 255];
    color0: [number, number, number, number] = [0, 0, 0, 255];
    color1: [number, number, number, number] = [255, 255, 255, 255];

    constructor(dimensions: { width: number, height: number }) {
        let layer = this.createLayer();
        let ctx = layer.getContext("2d", { willReadFrequently: true })!;
        ctx

        let template = this.createTemplate();
        let templateCtx = template.getContext("2d", { willReadFrequently: true })!;

        this.layers = [template, layer];
        this.ctxs = [templateCtx, ctx];

        this.setSize(dimensions);
        let size = this.getSize();

        let height = (window.innerHeight / 2);
        let width = height * size.width / size.height;
        this.setRealSize({ width, height });

        let pos = {
            x: window.innerWidth / 2 - width / 2,
            y: window.innerHeight / 2 - height / 2
        };
        this.setPos(pos);

        this.originalRealWidth = width;
        this.originalRealHeight = height;
    }

    setSize(size: { width: number, height: number }) {
        for (let canvas of this.layers) {
            canvas.width = size.width;
            canvas.height = size.height;
        }
    }

    getSize() {
        return { width: this.layers[0].width, height: this.layers[0].height };
    }

    setRealSize(size: { width: number, height: number }) {
        let width = size.width + "px";
        let height = size.height + "px";

        for (let canvas of this.layers) {
            canvas.style.width = width;
            canvas.style.height = height;
        }
    }

    getRealSize() {
        return { width: this.layers[0].offsetWidth, height: this.layers[0].offsetHeight };
    }

    setPos(size: { x: number, y: number }) {
        let x = size.x + "px";
        let y = size.y + "px";

        for (let canvas of this.layers) {
            canvas.style.left = x;
            canvas.style.top = y;
        }
    }

    getPos() {
        return { x: this.layers[0].offsetLeft, y: this.layers[0].offsetTop };
    }

    getBoundingClientRect() {
        return this.layers[0].getBoundingClientRect();
    }

    createLayer() {
        let layer = document.createElement("canvas");
        layer.id = "editorLayer";
        this.editorContainer.appendChild(layer);

        return layer;
    }

    createTemplate() {
        // remove template if it already exists
        let exists = document.getElementById("editorTemplate");
        if (exists != null) {
            exists.remove();
        }

        let template = document.createElement("canvas");
        template.id = "editorTemplate";
        this.editorContainer.appendChild(template);

        return template;
    }

    // clear layer
    clear(layer: number) {
        let size = this.getSize();
        this.ctxs[layer].clearRect(0, 0, size.width, size.height);
    }

    // clear all layers
    clearAll() {
        let size = this.getSize();
        for (let ctx of this.ctxs) {
            ctx.clearRect(0, 0, size.width, size.height);
        }
    }

    // mouse position relative to the canvas
    getMousePosition(event: MouseEvent) {
        let rect = this.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        return {
            'x': x,
            'y': y,
        };
    }

    // mouse coordinates relative to the canvas (pixel coordinates)
    getMouseCoords(event: MouseEvent) {
        let mousePos = this.getMousePosition(event);
        let size = this.getSize();
        let realSize = this.getRealSize();

        let x = Math.ceil(size.width * mousePos.x / realSize.width) - 1;
        let y = Math.ceil(size.height * mousePos.y / realSize.height) - 1;

        return {
            'x': x,
            'y': y,
        };
    }

    // imageData from the canvas
    getLayerBytes(layer: number) {
        let size = this.getSize();

        let imageData = this.ctxs[layer].getImageData(0, 0, size.width, size.height);
        let data: number[] = new Array(imageData.data.length);

        for (let i = 0; i < imageData.data.length; i++) {
            data[i] = imageData.data[i];
        }

        return data;
    }

    setImage(image: Image, layer: number) {
        this.ctxs[layer].putImageData(image.imageData, 0, 0);
    }

    getImage(layer: number) {
        let size = this.getSize();
        let imageData = this.ctxs[layer].getImageData(0, 0, size.width, size.height);
        let image = new Image(imageData, size);
        return image;
    }

    // center position of the canvas
    getCenterPos() {
        let pos = this.getPos();
        let realSize = this.getRealSize();
        let center = {
            x: pos.x + realSize.width / 2,
            y: pos.y + realSize.height / 2
        };

        return center;
    }

    // scale the canvas, zoom out when input is negative
    zoomIn(zoom_delta: number) {
        let center = this.getCenterPos();

        this.zoom += zoom_delta;
        if (this.zoom < 0.1) {
            this.zoom = 0.1;
        }

        let width = this.originalRealWidth * this.zoom;
        let height = this.originalRealHeight * this.zoom;
        this.setRealSize({ width, height });

        this.moveCenterTo(center);
    }

    // move the canvas by delta
    move(moveDelta: { x: number, y: number }) {
        let pos = this.getPos();
        let x = pos.x - moveDelta.x;
        let y = pos.y - moveDelta.y;

        this.setPos({ x, y });
    }

    // move the canvas center to position
    moveCenterTo(pos: { x: number, y: number }) {
        let realSize = this.getRealSize();

        let x = pos.x - realSize.width / 2;
        let y = pos.y - realSize.height / 2;

        this.setPos({ x, y });
    }
}

export class Image {
    imageData: ImageData;
    size: { width: number, height: number };

    constructor(
        imageData: ImageData,
        size: { width: number, height: number },
    ) {
        this.imageData = imageData;
        this.size = size;
    }

    // puts a pixel at the point with the selected color
    putPixel(
        point: { x: number, y: number },
        color: [number, number, number, number]
    ) {
        // return if outside of canvas
        if (point.x >= this.size.width || point.x < 0 || point.y >= this.size.height || point.y < 0) return;
        // 4 times to skip all color channels
        let index = 4 * (point.x + point.y * this.imageData.width);
        let pixels = this.imageData.data;
        pixels[index] = color[0];
        pixels[index + 1] = color[1];
        pixels[index + 2] = color[2];
        pixels[index + 3] = color[3];
    }

    getPixel(point: { x: number, y: number }) {
        let color: [number, number, number, number] = [0, 0, 0, 0];

        // 4 times to skip all color channels
        let index = 4 * (point.x + point.y * this.imageData.width);
        let pixels = this.imageData.data;
        color[0] = pixels[index];
        color[1] = pixels[index + 1];
        color[2] = pixels[index + 2];
        color[3] = pixels[index + 3];

        return color;
    }
}