import { Canvas } from "./canvas/canvas";
import { Palette } from "./palette";
import { PaintTools } from "./paintTools";
import { Layer } from "./canvas/layer";
import { FrameMessage, LayerMessage, ProjectMessage } from "../tauri";

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

    tools: PaintTools = new PaintTools();

    private isMouseOnEditorContainer = false;

    drag: boolean = false;

    palette: Palette;

    private animationFrame: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("animationFrame");
    private animationFrameCtx = this.animationFrame.getContext("2d", { willReadFrequently: true })!

    private fpsRange = <HTMLInputElement>document.getElementById("fpsRange");
    private fpsValue = <HTMLLabelElement>document.getElementById("fpsValue");
    private fps = 0;
    private animationInterval: ReturnType<typeof setInterval> | null = null;
    private animationFrameIndex = 0;

    private name: string;
    private path: string;

    private zoom: number = 1;

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
                this.addFrame(template, frame.layers);
            }
        } else { // add frame if there is none
            this.addFrame(template, []);
        }

        this.palette = new Palette(projectMessage.colors);

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
            }
        }

        this.name = projectMessage.name;
        this.path = projectMessage.path;

        this.updateFrameAndAnimationFrame();
        this.getCurrentCanvas().setRealSize(realSize);
        this.tools.choosePenTool();
    }

    getFps() {
        return this.fps;
    }

    generateProjectMessage() {
        let frames: FrameMessage[] = [];
        for (let canvas of this.canvases) {
            let layers: LayerMessage[] = [];
            for (let i = 1; i < canvas.getLayersLength(); i++) {
                let layer = canvas.getLayerByIndex(i);
                if (layer != null) {
                    let layerMessage: LayerMessage = {
                        name: layer.getName(),
                        data: Array.from(layer.getImageData()),
                    };
                    layers.push(layerMessage);
                }
            }
            let frameMessage: FrameMessage = {
                layers,
            };
            frames.push(frameMessage);
        }

        let size = this.getCurrentCanvas().getSize();


        let projectMessage: ProjectMessage = {
            name: this.name,
            width: size.width,
            height: size.height,
            frames,
            colors: this.palette.getColors(),
            path: this.path,
        };

        console.log("PAth: ", projectMessage.path);
        return projectMessage;
    }

    remove() {
        this.getCurrentCanvas().getTemplate().getCanvasElement().remove();
        this.canvases.forEach((canvas) => {
            canvas.getFrame().remove();
            canvas.remove();
        });

        // clear animationInterval
        if (this.animationInterval != null)
            clearInterval(this.animationInterval);

        // set fps to 0
        this.fpsRange.value = "0";
        this.fpsValue.textContent = this.fpsRange.value;

        // remove color palette colors
        this.palette.remove();
    }

    setPath(path: string) {
        this.path = path;
    }

    getPath() {
        return this.path;
    }

    getName() {
        return this.name;
    }

    getCanvasesLength() {
        return this.canvases.length;
    }

    /// add a frame to the editor and focus it, return it
    addFrame(template: Layer, layers: LayerMessage[]) {
        let canvas = new Canvas(this.framesContainer, template.getSize(), template, layers);
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

        // dont remove frame if it is the only one (first one added)
        // it deletes its images
        if (this.canvasIndex != null && this.canvases.length > 1) {
            this.getCurrentCanvas().remove();
        }
        this.canvasIndex = this.canvases.length - 1;
        this.setCurrentCanvas(this.canvasIndex, template);

        let moveUp = this.canvasIndex - oldCanvasIndex - 1;
        for (let i = 0; i < moveUp; i++) {
            this.moveFrameUp();
        }

        this.updateFrame();

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
        let newCanvas = this.addFrame(canvas.getTemplate(), []);
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

        this.getCurrentCanvas().updateFrameImage();
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
            let a = this.canvases[this.canvasIndex];
            let b = this.canvases[this.canvasIndex + 1];
            this.canvases[this.canvasIndex] = b;
            this.canvases[this.canvasIndex + 1] = a;

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

    getCanvas(index: number) {
        if (this.canvases.length > index) {
            return this.canvases[index];
        } else {
            return null;
        }
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

    getZoom() {
        return this.zoom;
    }

    setZoom(zoom: number) {
        this.zoom = zoom;
    }

    // update the current frame and the animation frame if fps is 0
    updateFrameAndAnimationFrame() {
        let image = this.updateFrame();

        if (this.fps == 0) {
            this.animationFrameCtx.putImageData(image.imageData, 0, 0);
        }
    }

    updateFrame() {
        let frameCtx = this.getCurrentCanvas().getFrameCtx();
        let image = this.getCurrentCanvas().getLayersImageCombined();

        frameCtx.putImageData(image.imageData, 0, 0);

        return image;
    }

    // set the animation frame image to the image of the frame
    setAnimationFrame(frameIndex: number) {
        let canvas = this.getCanvas(frameIndex);

        if (canvas != null) {
            let image = canvas.getFrameImage();
            this.animationFrameCtx.putImageData(image.imageData, 0, 0);
        }
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

        // clear the template layer
        this.getCurrentCanvas().getTemplate().clear();

        switch (event.button) {
            case 0:
                this.mouseButtons[0] = true;
                this.palette.setColorToPrimary();

                // if not moving with the canvas
                if (!this.drag && this.isMouseOnEditorContainer) {
                    this.tools.getPaintTool().onMouseDown(
                        this,
                        mouseCoords,
                        this.palette.getColor(),
                        this.getCurrentCanvas().getCurrentLayer(),
                        0,
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
                    this.tools.getPaintTool().onMouseDown(
                        this,
                        mouseCoords,
                        this.palette.getColor(),
                        this.getCurrentCanvas().getCurrentLayer(),
                        2,
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
                    this.tools.getPaintTool().onMouseUp(
                        this,
                        mouseCoords,
                        this.palette.getColor(),
                        this.getCurrentCanvas().getCurrentLayer(),
                    );

                    this.getCurrentCanvas().updateFrameImage();
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
                    this.tools.getPaintTool().onMouseUp(
                        this,
                        mouseCoords,
                        this.palette.getColor(),
                        this.getCurrentCanvas().getCurrentLayer(),
                    );

                    this.getCurrentCanvas().updateFrameImage();
                }
                break;
        }

        // show the current pixel
        let image = this.getCurrentCanvas().getTemplate().getImage();
        let toolColor = this.tools.getToolColor();
        let color = this.palette.getColor();

        if (toolColor != null) {
            color = toolColor;
        }

        image.putPixel(mouseCoords, color);
        this.getCurrentCanvas().getTemplate().setImage(image);

        this.updateFrameAndAnimationFrame();
    }

    onMouseMove(event: MouseEvent) {
        let mouseCoords = this.getCurrentCanvas().getMouseCoords(event);
        // mouse position relative to the viewport
        let mouseGlobalPos = { x: event.clientX, y: event.clientY };

        // clear the template layer
        this.getCurrentCanvas().getTemplate().clear();

        if (this.mouseButtons[0] || this.mouseButtons[2]) {
            // if moving with the canvas
            if (this.drag) {
                let moveDelta = {
                    x: mouseGlobalPos.x - this.lastMouseGlobalPos.x,
                    y: mouseGlobalPos.y - this.lastMouseGlobalPos.y
                };
                this.getCurrentCanvas().move(moveDelta);
            } else if (this.isMouseOnEditorContainer) { // paint
                this.tools.getPaintTool().onMouseMove(
                    this,
                    mouseCoords,
                    this.palette.getColor(),
                    this.getCurrentCanvas().getCurrentLayer(),
                );
            }
        } else if (this.mouseButtons[1]) {
            let moveDelta = {
                x: mouseGlobalPos.x - this.lastMouseGlobalPos.x,
                y: mouseGlobalPos.y - this.lastMouseGlobalPos.y
            };
            this.getCurrentCanvas().move(moveDelta);
        }

        // show the current pixel
        let image = this.getCurrentCanvas().getTemplate().getImage();
        let toolColor = this.tools.getToolColor();
        let color = this.palette.getColor();

        if (toolColor != null) {
            color = toolColor;
        }

        image.putPixel(mouseCoords, color);
        this.getCurrentCanvas().getTemplate().setImage(image);

        // save the mouse
        this.lastMouseGlobalPos = mouseGlobalPos;
    }

    onWheel(event: WheelEvent) {
        let zoomDelta = Math.sign(-event.deltaY) * 0.1;
        this.zoom = this.getCurrentCanvas().zoomIn(this.zoom, zoomDelta, this.lastMouseGlobalPos);
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
