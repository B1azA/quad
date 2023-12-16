import { Canvas } from "./canvas";
import { Palette } from "./palette";
import { PaintTool } from "./paintTool/paintTool";
import { Pen } from "./paintTool/pen";
import { Ruler } from "./paintTool/ruler";
import { Compass } from "./paintTool/compass";
import { Square } from "./paintTool/square";

import { fromRatio } from "@ctrl/tinycolor";

export enum ColorState {
    PRIMARY,
    SECONDARY,
}

export class Editor {
    // pressed mouse buttons
    mouseButtons: [boolean, boolean, boolean] = [false, false, false];

    // last coordinates of the mouse
    lastMouseCoords: {
        x: number,
        y: number,
    } = { x: 0, y: 0 };

    lastMouseGlobalPos: {
        x: number,
        y: number,
    } = { x: 0, y: 0 };

    canvas: Canvas;

    paintTool: PaintTool = new Pen;
    penTool: PaintTool = new Pen;
    rulerTool: PaintTool = new Ruler;
    compassTool: PaintTool = new Compass;
    squareTool: PaintTool = new Square;

    private isMouseOnEditorContainer = false;

    drag: boolean = false;

    palette: Palette;

    constructor(size: { width: number, height: number }) {
        this.canvas = new Canvas(size);

        let layer = this.canvas.createLayerTransformed();
        this.canvas.addLayer(layer, "secondary");

        let layer2 = this.canvas.createLayerTransformed();
        this.canvas.addLayer(layer2, "terciary");

        let colors: [number, number, number, number][] = [
            [128, 255, 255, 255],
            [128, 128, 255, 255],
            [128, 255, 128, 255],
            [128, 128, 128, 255],
            [255, 255, 255, 255],
            [128, 255, 255, 255],
            [128, 128, 255, 255],
            [128, 255, 128, 255],
            [128, 128, 128, 255],
            [255, 255, 255, 255],
            [128, 255, 255, 255],
            [128, 128, 255, 255],
            [128, 255, 128, 255],
            [128, 128, 128, 255],
            [255, 255, 255, 255],
        ];
        this.palette = new Palette(this, colors);
    }

    onMouseDown(event: MouseEvent) {
        let mouseCoords = this.canvas.getMouseCoords(event);

        switch (event.button) {
            case 0:
                this.mouseButtons[0] = true;
                this.palette.setColorToPrimary();

                // if not moving with the canvas
                if (!this.drag && this.isMouseOnEditorContainer) {
                    this.paintTool.onMouseDown(
                        this,
                        mouseCoords,
                        this.palette.getColor(),
                        this.canvas.getLayer(),
                    );
                }
                break;
            case 1:
                this.mouseButtons[1] = true;
                break
            case 2:
                this.mouseButtons[2] = true;
                this.palette.setColorToSecondary();

                // if not moving with the canvas
                if (!this.drag && this.isMouseOnEditorContainer) {
                    this.paintTool.onMouseDown(
                        this,
                        mouseCoords,
                        this.palette.getColor(),
                        this.canvas.getLayer(),
                    );
                }
                break;
        }
    }

    onMouseUp(event: MouseEvent) {
        let mouseCoords = this.canvas.getMouseCoords(event);
        switch (event.button) {
            case 0:
                this.mouseButtons[0] = false;
                this.palette.setColorToPrimary();

                // if not moving with the canvas
                if (!this.drag && this.isMouseOnEditorContainer) {
                    this.paintTool.onMouseUp(
                        this,
                        mouseCoords,
                        this.palette.getColor(),
                        this.canvas.getLayer(),
                    );
                }
                break;

            case 1:
                this.mouseButtons[1] = false;
                break

            case 2:
                this.mouseButtons[2] = false;
                this.palette.setColorToSecondary();

                // if not moving with the canvas
                if (!this.drag && this.isMouseOnEditorContainer) {
                    this.paintTool.onMouseUp(
                        this,
                        mouseCoords,
                        this.palette.getColor(),
                        this.canvas.getLayer(),
                    );
                }
                break;
        }
    }

    onMouseMove(event: MouseEvent) {
        let mouseCoords = this.canvas.getMouseCoords(event);
        // mouse position realative to vieport, not the this
        let mouseGlobalPos = { x: event.clientX, y: event.clientY };

        // clear template layer
        this.canvas.clear(0);

        if (this.mouseButtons[0] || this.mouseButtons[2]) {
            // if moving with the canvas
            if (this.drag) {
                let moveDelta = {
                    x: this.lastMouseGlobalPos.x - mouseGlobalPos.x,
                    y: this.lastMouseGlobalPos.y - mouseGlobalPos.y
                };
                this.canvas.move(moveDelta);
            } else if (this.isMouseOnEditorContainer) { // paint
                this.paintTool.onMouseMove(
                    this,
                    mouseCoords,
                    this.palette.getColor(),
                    this.canvas.getLayer(),
                );
            }
        } else if (this.mouseButtons[1]) {
            let moveDelta = {
                x: this.lastMouseGlobalPos.x - mouseGlobalPos.x,
                y: this.lastMouseGlobalPos.y - mouseGlobalPos.y
            };
            this.canvas.move(moveDelta);
        }

        // show current pixel
        let image = this.canvas.getImage(0);
        image.putPixel(mouseCoords, this.palette.getColor());
        this.canvas.setImage(image, 0);

        // save mouse
        this.lastMouseCoords = mouseCoords;
        this.lastMouseGlobalPos = mouseGlobalPos;
    }

    onWheel(event: WheelEvent) {
        let zoom = Math.sign(-event.deltaY) * 0.1;
        this.canvas.zoomIn(zoom);
        this.onMouseMove(event);
    }

    onKeyDown(event: KeyboardEvent) {
        this.drag = event.ctrlKey;
    }

    onKeyUp(event: KeyboardEvent) {
        this.drag = event.ctrlKey;
    }

    onMouseEnter() {
        this.isMouseOnEditorContainer = true;
    }

    onMouseLeave() {
        this.isMouseOnEditorContainer = false;
    }
}
