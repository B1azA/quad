import { Canvas } from "./canvas/canvas";
import { Palette } from "./palette";
import { PaintTool } from "./paintTool/paintTool";
import { Pen } from "./paintTool/pen";
import { Ruler } from "./paintTool/ruler";
import { Compass } from "./paintTool/compass";
import { Square } from "./paintTool/square";
import { Layer } from "./canvas/layer";
import { ProjectMessage } from "../tauri";

export enum ColorState {
    PRIMARY,
    SECONDARY,
}

export class Editor {
    // pressed mouse buttons
    private mouseButtons: [boolean, boolean, boolean] = [false, false, false];

    private lastMouseGlobalPos: {
        x: number,
        y: number,
    } = { x: 0, y: 0 };

    // index of the current canvas in the canvases
    private canvasIndex: number = 0;

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
    private animationInterval: NodeJS.Timeout | null = null;
    private animationFrameIndex = 0;

    constructor(projectMessage: ProjectMessage) {
        let size = { width: projectMessage.width, height: projectMessage.height };
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

        // add frames
        if (projectMessage.frames.length != 0) {
            for (let frame of projectMessage.frames) {
                this.addFrame(template);
            }
        } else { // add frame if there is none
            this.addFrame(template);
        }

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
            if (this.animationInterval != null)
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

    /// add a frame to the editor and focus it, return it
    addFrame(template: Layer) {
        let canvas = new Canvas(this.framesContainer, template.getSize());
        this.canvases.push(canvas);

        let oldCanvasIndex = this.canvasIndex;

        let frame = canvas.getFrame();
        let index = this.canvases.length - 1;
        frame.onclick = () => {
            this.getCurrentCanvas().getFrame().id = "normalFrame";
            this.getCurrentCanvas().remove();

            this.setCurrentCanvas(index, template);
            this.updateFrameAndAnimationFrame();
        };


        if (this.canvasIndex != null) {
            this.getCurrentCanvas().remove();
        }
        this.canvasIndex = this.canvases.length - 1;
        this.setCurrentCanvas(this.canvasIndex, template);

        let moveUp = this.canvasIndex - oldCanvasIndex - 1;
        for (let i = 0; i < moveUp; i++) {
            this.moveFrameUp();
        }

        return canvas;
    }

    removeFrame() {
        if (this.canvases.length >= 2) {
            // remove the current canvas from the canvases
            let template = this.getCurrentCanvas().getTemplate();
            this.getCurrentCanvas().remove();
            this.getCurrentCanvas().getFrame().remove();
            this.canvases.splice(this.canvasIndex, 1);

            // set the new current canvas
            if (this.canvasIndex < this.canvases.length)
                this.setCurrentCanvas(this.canvasIndex, template);
            else
                this.setCurrentCanvas(this.canvasIndex - 1, template);

            // set new indexes for each canvas
            for (let i = 0; i < this.canvases.length; i++) {
                this.canvases[i].getFrame().onclick = () => {
                    this.getCurrentCanvas().getFrame().id = "normalFrame";
                    this.getCurrentCanvas().remove();

                    this.setCurrentCanvas(i, template);
                }
            }
            this.updateFrameAndAnimationFrame();
        }
    }

    duplicateFrame() {
        let canvas = this.getCurrentCanvas();
        let newCanvas = this.addFrame(canvas.getTemplate());
        let layersLength = canvas.getLayersLength();

        let firstLayer = canvas.getLayer(1);
        let newFirstLayer = newCanvas.getLayer(1);

        if (firstLayer != null && newFirstLayer != null) {
            newFirstLayer.setName(firstLayer.getName());
            newFirstLayer.setImage(firstLayer.getImage());
        }

        for (let i = 2; i < layersLength; i++) {
            let layer = canvas.getLayer(i);
            if (layer != null) {
                newCanvas.addLayer(layer.getName());
                let newLayer = newCanvas.getLayer(i);
                if (newLayer != null) {
                    newLayer.setImage(layer.getImage());
                }
            }

        }

        this.updateFrameAndAnimationFrame();
    }

    moveFrameUp() {
        if (this.canvasIndex > 0) {
            // remove the old canvas
            this.getCurrentCanvas().remove();
            // switch frames
            let a = this.canvases[this.canvasIndex];
            let b = this.canvases[this.canvasIndex - 1];
            this.canvases[this.canvasIndex] = b;
            this.canvases[this.canvasIndex - 1] = a;

            // remove all frames
            for (let canvas of this.canvases) {
                canvas.getFrame().remove();
            }

            // add frames
            for (let i = 0; i < this.canvases.length; i++) {
                let frame = this.canvases[i].getFrame();

                frame.onclick = () => {
                    this.getCurrentCanvas().getFrame().id = "normalFrame";
                    this.getCurrentCanvas().remove();

                    this.setCurrentCanvas(i, this.getCurrentCanvas().getTemplate());
                }

                this.framesContainer.appendChild(frame);
            }

            this.setCurrentCanvas(this.canvasIndex - 1, this.getCurrentCanvas().getTemplate());

            this.updateFrameAndAnimationFrame();
        }
    }

    moveFrameDown() {
        let length = this.canvases.length;
        if (this.canvasIndex < length - 1) {
            // remove the old canvas
            this.getCurrentCanvas().remove();
            // switch frames
            let a = this.canvases[length - 1];
            let b = this.canvases[length - 2];
            this.canvases[length - 1] = b;
            this.canvases[length - 2] = a;

            // remove all frames
            for (let canvas of this.canvases) {
                canvas.getFrame().remove();
            }

            // add frames
            for (let i = 0; i < this.canvases.length; i++) {
                let frame = this.canvases[i].getFrame();

                frame.onclick = () => {
                    this.getCurrentCanvas().getFrame().id = "normalFrame";
                    this.getCurrentCanvas().remove();

                    this.setCurrentCanvas(i, this.getCurrentCanvas().getTemplate());
                }

                this.framesContainer.appendChild(frame);
            }

            this.setCurrentCanvas(this.canvasIndex + 1, this.getCurrentCanvas().getTemplate());

            this.updateFrameAndAnimationFrame();
        }
    }

    getCurrentCanvas() {
        return this.canvases[this.canvasIndex];
    }

    setCurrentCanvas(canvasIndex: number, template: Layer) {
        this.canvasIndex = canvasIndex;
        this.canvases.forEach((cnvs) => {
            cnvs.getFrame().id = "normalFrame";
        });

        let canvas = this.getCurrentCanvas();

        canvas.getFrame().id = "currentFrame";
        canvas.init(template, this.originalRealSize.width, this.originalRealSize.height);
    }

    // update the current frame and the animation frame if fps is 0
    updateFrameAndAnimationFrame() {
        let frameCtx = this.getCurrentCanvas().getFrameCtx();
        let image = this.getCurrentCanvas().getLayersImageCombined();

        frameCtx.putImageData(image.imageData, 0, 0);

        if (this.fps == 0) {
            this.animationFrameCtx.putImageData(image.imageData, 0, 0);
        }
    }

    updateFrame() {
        let frameCtx = this.getCurrentCanvas().getFrameCtx();
        let image = this.getCurrentCanvas().getLayersImageCombined();

        frameCtx.putImageData(image.imageData, 0, 0);
    }

    // set the animation frame image to the image of the frame
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
        let mouseCoords = this.getCurrentCanvas().getMouseCoords(event);

        // clear template layer
        this.getCurrentCanvas().getTemplate().clear();
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
                        this.getCurrentCanvas().getCurrentLayer(),
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
                        this.getCurrentCanvas().getCurrentLayer(),
                    );
                }
                break;
        }
    }

    onMouseUp(event: MouseEvent) {
        let mouseCoords = this.getCurrentCanvas().getMouseCoords(event);
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
                        this.getCurrentCanvas().getCurrentLayer(),
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
                        this.getCurrentCanvas().getCurrentLayer(),
                    );

                    this.updateFrameAndAnimationFrame();
                }
                break;
        }
    }

    onMouseMove(event: MouseEvent) {
        let mouseCoords = this.getCurrentCanvas().getMouseCoords(event);
        // mouse position realative to vieport, not the this
        let mouseGlobalPos = { x: event.clientX, y: event.clientY };

        // clear template layer
        this.getCurrentCanvas().getTemplate().clear();

        if (this.mouseButtons[0] || this.mouseButtons[2]) {
            // if moving with the canvas
            if (this.drag) {
                let moveDelta = {
                    x: this.lastMouseGlobalPos.x - mouseGlobalPos.x,
                    y: this.lastMouseGlobalPos.y - mouseGlobalPos.y
                };
                this.getCurrentCanvas().move(moveDelta);
            } else if (this.isMouseOnEditorContainer) { // paint
                this.paintTool.onMouseMove(
                    this,
                    mouseCoords,
                    this.palette.getColor(),
                    this.getCurrentCanvas().getCurrentLayer(),
                );
            }
        } else if (this.mouseButtons[1]) {
            let moveDelta = {
                x: this.lastMouseGlobalPos.x - mouseGlobalPos.x,
                y: this.lastMouseGlobalPos.y - mouseGlobalPos.y
            };
            this.getCurrentCanvas().move(moveDelta);
        }

        // show current pixel
        let image = this.getCurrentCanvas().getTemplate().getImage();
        image.putPixel(mouseCoords, this.palette.getColor());
        this.getCurrentCanvas().getTemplate().setImage(image);

        // save mouse
        this.lastMouseGlobalPos = mouseGlobalPos;
    }

    onWheel(event: WheelEvent) {
        let zoom = Math.sign(-event.deltaY) * 0.1;
        this.getCurrentCanvas().zoomIn(zoom);
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
