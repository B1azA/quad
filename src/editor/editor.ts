import { Canvas } from "./canvas";
import { PaintTool } from "./paintTool/paintTool";
import { Steps } from "./paintTool/steps";
import { Pen } from "./paintTool/pen";
import { Ruler } from "./paintTool/ruler";
import { Compass } from "./paintTool/compass";
import { Square } from "./paintTool/square";

export class Editor {
    // curently selected color
    // either primary or secondary
    color: [number, number, number, number] = [0, 0, 0, 255];
    primaryColor: [number, number, number, number] = [0, 0, 0, 255];
    secondaryColor: [number, number, number, number] = [255, 0, 255, 255];

    templateLayer: number = 0;
    layer: number = 1;

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

    rulerStartCoords: { x: number, y: number };
    rulerEndCoords: { x: number, y: number };

    canvas: Canvas;

    steps: Steps;

    paintTool: PaintTool = new Pen;
    penTool: PaintTool = new Pen;
    rulerTool: PaintTool = new Ruler;
    compassTool: PaintTool = new Compass;
    squareTool: PaintTool = new Square;

    ctrlPressed: boolean = false;

    constructor(size: { width: number, height: number }) {
        this.canvas = new Canvas(this, size);
        this.steps = new Steps();

        this.rulerStartCoords = { x: -1, y: -1 };
        this.rulerEndCoords = { x: -1, y: -1 };

        let layer = this.canvas.createLayerTransformed();
        this.canvas.addLayer(layer);
        this.layer = 2;
    }

    onMouseDown(event: MouseEvent) {
        let mouseCoords = this.canvas.getMouseCoords(event);

        switch (event.button) {
            case 0:
                this.steps.newStep();
                this.mouseButtons[0] = true;
                this.color = this.primaryColor;
                this.paintTool.onMouseDown(
                    this,
                    mouseCoords,
                    this.color,
                    this.layer,
                );
                break;
            case 1:
                this.mouseButtons[1] = true;
                break
            case 2:
                this.steps.newStep();
                this.mouseButtons[2] = true;
                this.color = this.secondaryColor;
                this.paintTool.onMouseDown(
                    this,
                    mouseCoords,
                    this.color,
                    this.layer,
                );
                break;
        }
    }

    onMouseUp(event: MouseEvent) {
        let mouseCoords = this.canvas.getMouseCoords(event);
        switch (event.button) {
            case 0:
                this.mouseButtons[0] = false;
                this.paintTool.onMouseUp(
                    this,
                    mouseCoords,
                    this.color,
                    this.layer,
                );
                break;

            case 1:
                this.mouseButtons[1] = false;
                break

            case 2:
                this.mouseButtons[2] = false;
                this.paintTool.onMouseUp(
                    this,
                    mouseCoords,
                    this.color,
                    this.layer,
                );
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
            this.paintTool.onMouseMove(
                this,
                mouseCoords,
                this.color,
                this.layer,
            );
        } else if (this.mouseButtons[1]) {
            let moveDelta = {
                x: this.lastMouseGlobalPos.x - mouseGlobalPos.x,
                y: this.lastMouseGlobalPos.y - mouseGlobalPos.y
            };
            this.canvas.move(moveDelta);
        }

        // show current pixel
        let image = this.canvas.getImage(0);
        image.putPixel(mouseCoords, this.color);
        this.canvas.setImage(image, 0);

        // save mouse
        this.lastMouseCoords = mouseCoords;
        this.lastMouseGlobalPos = mouseGlobalPos;
    }

    onWheel(event: WheelEvent) {
        let zoom = Math.sign(-event.deltaY) * 0.1;
        this.canvas.zoomIn(zoom);
    }

    onKeyDown(event: KeyboardEvent) {
        this.ctrlPressed = event.ctrlKey;
    }

    onKeyUp(event: KeyboardEvent) {
        if (event.ctrlKey) {
            this.ctrlPressed = false;
        }
    }
}
