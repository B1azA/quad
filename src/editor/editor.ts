import { Canvas } from "./canvas/canvas";
import { Palette } from "./palette";
import { PaintTool } from "./paintTool/paintTool";
import { Pen } from "./paintTool/pen";
import { Ruler } from "./paintTool/ruler";
import { Compass } from "./paintTool/compass";
import { Square } from "./paintTool/square";
import { Layer } from "./canvas/layer";

export enum ColorState {
    PRIMARY,
    SECONDARY,
}

export class Editor {
    // pressed mouse buttons
    private mouseButtons: [boolean, boolean, boolean] = [false, false, false];

    // last coordinates of the mouse
    private lastMouseCoords: {
        x: number,
        y: number,
    } = { x: 0, y: 0 };

    private lastMouseGlobalPos: {
        x: number,
        y: number,
    } = { x: 0, y: 0 };

    private canvas: Canvas;

    private canvases: Canvas[] = [];
    private framesContainer = document.getElementById("frames")!;
    private editorContainer = document.getElementById("editorContainer")!;
    private originalRealSize = { width: 0, height: 0 };

    paintTool: PaintTool = new Pen;
    penTool: PaintTool = new Pen;
    rulerTool: PaintTool = new Ruler;
    compassTool: PaintTool = new Compass;
    squareTool: PaintTool = new Square;

    private isMouseOnEditorContainer = false;

    drag: boolean = false;

    palette: Palette;

    constructor(size: { width: number, height: number }) {
        let height = (window.innerHeight / 2);
        let width = height * size.width / size.height;
        let realSize = { width, height };
        let pos = {
            x: window.innerWidth / 2 - width / 2,
            y: window.innerHeight / 2 - height / 2
        };

        this.originalRealSize = realSize;

        let template = new Layer("template", 100, size, realSize, pos, true);
        template.init(this.editorContainer);

        let canvas = this.addFrame(template);
        canvas.init(template, this.originalRealSize.width, this.originalRealSize.height);
        canvas.getFrame().id = "currentFrame";
        this.canvas = canvas;

        let colors: [number, number, number, number][] = [
            [128, 255, 255, 255],
            [128, 128, 255, 255],
            [128, 255, 128, 255],
            [128, 128, 128, 255],
            [255, 255, 255, 255],
        ];
        this.palette = new Palette(this, colors);
    }

    addFrame(template: Layer) {
        let canvas = new Canvas(this.framesContainer, template.getSize());
        this.canvases.push(canvas);

        let frame = canvas.getFrame();
        frame.onclick = () => {
            if (this.canvas != canvas) {
                this.canvas.getFrame().id = "normalFrame";
                this.canvas.remove();

                canvas.getFrame().id = "currentFrame";
                canvas.init(template, this.originalRealSize.width, this.originalRealSize.height);

                this.canvas = canvas;
            }
        };

        return canvas;
    }

    getCurrentCanvas() {
        return this.canvas;
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
                        this.canvas.getCurrentLayer(),
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
                        this.canvas.getCurrentLayer(),
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
                        this.canvas.getCurrentLayer(),
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
                        this.canvas.getCurrentLayer(),
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
        this.canvas.getTemplate().clear();

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
                    this.canvas.getCurrentLayer(),
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
        let image = this.canvas.getTemplate().getImage();
        image.putPixel(mouseCoords, this.palette.getColor());
        this.canvas.getTemplate().setImage(image);

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
