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

    private animationFrame: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("animationFrame");
    private animationFrameCtx = this.animationFrame.getContext("2d", { willReadFrequently: true })!

    private fpsRange = <HTMLInputElement>document.getElementById("fpsRange");
    private fpsValue = <HTMLLabelElement>document.getElementById("fpsValue");
    private fps = 0;
    private animationInterval = null;
    private animationFrameIndex = 0;

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

        this.animationFrame.width = size.width;
        this.animationFrame.height = size.height;

        this.fpsRange.oninput = () => {
            this.fpsValue.textContent = this.fpsRange.value;
            this.fps = parseInt(this.fpsRange.value);

            // clear animationInterval before creating another
            clearInterval(this.animationInterval);

            if (this.fps != 0) {
                this.animationInterval = setInterval(() => {
                    this.setAnimationFrame(this.animationFrameIndex);
                    this.animationFrameIndex += 1;

                    if (this.animationFrameIndex >= this.canvases.length) {
                        this.animationFrameIndex = 0;
                    }
                }, 1 / this.fps * 1000);
            } else {
                this.updateFrameAndAnimationFrame();
            }
        }
    }

    // add a frame to the editor and focus it, return it
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


        this.canvases.forEach((cnvs) => {
            cnvs.getFrame().id = "normalFrame";
        });

        if (this.canvas != null) {
            this.canvas.remove();
        }

        canvas.getFrame().id = "currentFrame";
        canvas.init(template, this.originalRealSize.width, this.originalRealSize.height);

        this.canvas = canvas;

        return this.canvas;
    }

    getCurrentCanvas() {
        return this.canvas;
    }

    // update the current frame and the animation frame if fps is 0
    updateFrameAndAnimationFrame() {
        let frameCtx = this.canvas.getFrameCtx();
        let image = this.canvas.getLayersImageCombined();

        frameCtx.putImageData(image.imageData, 0, 0);

        if (this.fps == 0) {
            this.animationFrameCtx.putImageData(image.imageData, 0, 0);
        }
    }

    updateFrame() {
        let frameCtx = this.canvas.getFrameCtx();
        let image = this.canvas.getLayersImageCombined();

        frameCtx.putImageData(image.imageData, 0, 0);
    }

    // set the animation frame image to the image of the current frame
    setAnimationFrame(frameIndex: number) {
        let canvas = this.canvases[frameIndex];
        let image = canvas.getLayersImageCombined();

        this.animationFrameCtx.putImageData(image.imageData, 0, 0);
    }

    undoStepOnCanvas() {
        let canvas = this.getCurrentCanvas();
        canvas.steps.undoStep(canvas);

        this.updateFrameAndAnimationFrame();
    }

    redoStepOnCanvas() {
        let canvas = this.getCurrentCanvas();
        canvas.steps.redoStep(canvas);

        this.updateFrameAndAnimationFrame();
    }

    onMouseDown(event: MouseEvent) {
        let mouseCoords = this.canvas.getMouseCoords(event);

        // clear template layer
        this.canvas.getTemplate().clear();
        this.updateFrameAndAnimationFrame();

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

                    this.updateFrameAndAnimationFrame();
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

                    this.updateFrameAndAnimationFrame();
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
        let key = event.key;

        switch (key) {
            case "Control":
                this.drag = true;
                break;
        }
    }

    onKeyUp(event: KeyboardEvent) {
        let key = event.key;

        switch (key) {
            case "Control":
                this.drag = false;
                break;
        }
    }

    onMouseEnter() {
        this.isMouseOnEditorContainer = true;
    }

    onMouseLeave() {
        this.isMouseOnEditorContainer = false;
    }
}
