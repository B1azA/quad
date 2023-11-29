import { Canvas } from "./editor/canvas";

export enum PaintingTool {
    Pen,
    Ruler,
}

export class Editor {
    private canvases: HTMLCanvasElement[];
    private ctxs: CanvasRenderingContext2D[];

    // original width and height of the canvas
    private originalRealWidth: number;
    private originalRealHeight: number;

    private zoom: number = 1;

    // currentColor is currently selected on
    // color0 or color1 can be selected
    currentColor: [number, number, number, number] = [0, 0, 0, 255];
    color0: [number, number, number, number] = [0, 0, 0, 255];
    color1: [number, number, number, number] = [255, 255, 255, 255];

    paintingTool: PaintingTool;
    templateLayer: number = 0;
    layer: number = 1;

    // pressed mouse buttons
    mouseButtons: [boolean, boolean, boolean] = [false, false, false];

    // last coordinates of the mouse
    lastMouseCoords: {
        x: number,
        y: number,
    } = { x: 0, y: 0 };

    rulerStartCoords: { x: number, y: number };
    rulerEndCoords: { x: number, y: number };

    canvas: Canvas;

    constructor() {
        let canvas = document.getElementById("editor") as HTMLCanvasElement;
        let ctx = canvas.getContext("2d")!;
        let template = this.createTemplate();
        let templateCtx = template.getContext("2d")!;

        this.canvases = [template, canvas];
        this.ctxs = [templateCtx, ctx];

        this.setCanvasesSize({ width: 48, height: 32 });
        let canvasesSize = this.getCanvasesSize();

        let height = (window.innerHeight / 2);
        let width = height * canvasesSize.width / canvasesSize.height;
        this.setCanvasesRealSize({ width, height });

        let pos = {
            x: window.innerWidth / 2 - width / 2,
            y: window.innerHeight / 2 - height / 2
        };
        this.setCanvasesPos(pos);

        this.originalRealWidth = width;
        this.originalRealHeight = height;

        this.paintingTool = PaintingTool.Pen;
        this.rulerStartCoords = { x: -1, y: -1 };
        this.rulerEndCoords = { x: -1, y: -1 };

        this.canvas = new Canvas();
    }

    setCanvasesSize(size: { width: number, height: number }) {
        for (let canvas of this.canvases) {
            canvas.width = size.width;
            canvas.height = size.height;
        }
    }

    getCanvasesSize() {
        return { width: this.canvases[0].width, height: this.canvases[0].height };
    }

    setCanvasesRealSize(size: { width: number, height: number }) {
        let width = size.width + "px";
        let height = size.height + "px";

        for (let canvas of this.canvases) {
            canvas.style.width = width;
            canvas.style.height = height;
        }
    }

    getCanvasesRealSize() {
        return { width: this.canvases[0].offsetWidth, height: this.canvases[0].offsetHeight };
    }

    setCanvasesPos(size: { x: number, y: number }) {
        let x = size.x + "px";
        let y = size.y + "px";

        for (let canvas of this.canvases) {
            canvas.style.left = x;
            canvas.style.top = y;
        }
    }

    getCanvasesPos() {
        return { x: this.canvases[0].offsetLeft, y: this.canvases[0].offsetTop };
    }

    getCanvasesBoundingClientRect() {
        return this.canvases[0].getBoundingClientRect();
    }

    createTemplate() {
        // remove template if it already exists
        let exists = document.getElementById("editorTemplate");
        if (exists) {
            document.removeChild(exists);
        }

        let editorContainer = document.getElementById("editorContainer")!;

        let template = document.createElement("canvas");
        template.id = "editorTemplate";
        editorContainer.appendChild(template);

        return template;
    }

    // clear canvas
    clear(layer: number) {
        let size = this.getCanvasesSize();
        this.ctxs[layer].clearRect(0, 0, size.width, size.height);
    }

    // clear all canvases
    clearAll() {
        let size = this.getCanvasesSize();
        for (let ctx of this.ctxs) {
            ctx.clearRect(0, 0, size.width, size.height);
        }
    }

    /// draw a pixel at the point with currentColor
    drawPixel(point: { x: number, y: number }, layer: number) {
        // return if outside of canvas
        let size = this.getCanvasesSize();
        if (point.x >= size.width || point.x < 0 || point.y >= size.height || point.y < 0) return;

        let imageData = this.ctxs[layer].getImageData(0, 0, size.width, size.height);
        // 4 times to skip all color channels
        let index = 4 * (point.x + point.y * imageData.width);
        let pixels = imageData.data;
        pixels[index] = this.currentColor[0];
        pixels[index + 1] = this.currentColor[1];
        pixels[index + 2] = this.currentColor[2];
        pixels[index + 3] = this.currentColor[3];

        this.ctxs[layer].putImageData(imageData, 0, 0);
    }

    // draw a line from the point a to the point b with currentColor
    drawLine(a: { x: number, y: number }, b: { x: number, y: number }, layer: number) {
        let size = this.getCanvasesSize();
        let isAOnCanvas = a.x >= 0 && a.x < size.width && a.y >= 0 && a.y < size.height;
        let isBOnCanvas = b.x >= 0 && b.x < size.width && b.y >= 0 && b.y < size.height;
        // return if points a and b are both not on the canvas
        if (!isAOnCanvas && !isBOnCanvas) return;

        // difference
        let dx = b.x - a.x;
        let dy = b.y - a.y;

        // number of steps to take, use bigger step
        let steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);

        // increments
        let xInc = dx / steps;
        let yInc = dy / steps;

        let x = a.x;
        let y = a.y;

        let imageData = this.getImageData(layer);
        let pixels = imageData.data;

        for (let i = 0; i <= steps; i++) {
            let point = { x: Math.round(x), y: Math.round(y) };

            // paint only if in the canvas
            if (point.x < size.width && point.x >= 0 && point.y < size.height && point.y >= 0) {
                // 4 times to skip all color channels
                let index = 4 * (point.x + point.y * imageData.width);
                pixels[index] = this.currentColor[0];
                pixels[index + 1] = this.currentColor[1];
                pixels[index + 2] = this.currentColor[2];
                pixels[index + 3] = this.currentColor[3];
            }

            x += xInc;
            y += yInc;

            // break if outside of the canvas
            if ((x >= size.width && y >= size.height) || (x < 0 && y < 0)) {
                break;
            };
        }

        this.ctxs[layer].putImageData(imageData, 0, 0);
    }

    // mouse position relative to the canvas
    getMousePosition(event: MouseEvent) {
        let rect = this.getCanvasesBoundingClientRect();
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
        let size = this.getCanvasesSize();
        let realSize = this.getCanvasesRealSize();

        let x = Math.ceil(size.width * mousePos.x / realSize.width) - 1;
        let y = Math.ceil(size.height * mousePos.y / realSize.height) - 1;

        return {
            'x': x,
            'y': y,
        };
    }

    // imageData from the canvas
    getLayerBytes(layer: number) {
        let size = this.getCanvasesSize();

        let imageData = this.ctxs[layer].getImageData(0, 0, size.width, size.height);
        let data: number[] = new Array(imageData.data.length);

        for (let i = 0; i < imageData.data.length; i++) {
            data[i] = imageData.data[i];
        }

        return data;
    }

    getImageData(layer: number) {
        let size = this.getCanvasesSize();
        let imageData = this.ctxs[layer].getImageData(0, 0, size.width, size.height);
        return imageData;
    }

    // center position of the canvas
    getCenterPos() {
        let pos = this.getCanvasesPos();
        let realSize = this.getCanvasesRealSize();
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
        let width = this.originalRealWidth * this.zoom;
        let height = this.originalRealHeight * this.zoom;
        this.setCanvasesRealSize({ width, height });

        this.moveCenterTo(center);
    }

    // move the canvas by delta
    move(moveDelta: { x: number, y: number }) {
        let pos = this.getCanvasesPos();
        let x = pos.x - moveDelta.x;
        let y = pos.y - moveDelta.y;

        this.setCanvasesPos({ x, y });
    }

    // move the canvas center to position
    moveCenterTo(pos: { x: number, y: number }) {
        let realSize = this.getCanvasesRealSize();

        let x = pos.x - realSize.width / 2;
        let y = pos.y - realSize.height / 2;

        this.setCanvasesPos({ x, y });
    }
}