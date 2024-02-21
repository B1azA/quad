import { PaintTool } from "./paintTool/paintTool";
import { Pen } from "./paintTool/pen";
import { Ruler } from "./paintTool/ruler";
import { Compass } from "./paintTool/compass";
import { FilledCircle } from "./paintTool/filledCircle";
import { Square } from "./paintTool/square";
import { FilledSquare } from "./paintTool/filledSquare";
import { Eraser } from "./paintTool/eraser";
import { Bucket } from "./paintTool/bucket";

export class PaintTools {
    private toolBar = <HTMLElement>document.getElementById("toolBar");
    private paintTool: PaintTool = new Pen;
    readonly penTool: PaintTool = new Pen;
    readonly rulerTool: PaintTool = new Ruler;
    readonly compassTool: PaintTool = new Compass;
    readonly filledCircleTool: PaintTool = new FilledCircle;
    readonly squareTool: PaintTool = new Square;
    readonly filledSquareTool: PaintTool = new FilledSquare;
    readonly eraserTool: PaintTool = new Eraser;
    readonly bucketTool: PaintTool = new Bucket;
    private toolColor: [number, number, number, number] | null = null;

    getPaintTool() {
        return this.paintTool;
    }

    getToolColor() {
        return this.toolColor;
    }

    choosePenTool() {
        this.paintTool = this.penTool;
        let penButton = document.getElementById("penTool");

        this.setButtonsToNormal();

        if (penButton != null)
            penButton.className = "selectedTool";

        this.toolColor = null;
    }

    chooseRulerTool() {
        this.paintTool = this.rulerTool;
        let rulerButton = document.getElementById("rulerTool");

        this.setButtonsToNormal();

        if (rulerButton != null)
            rulerButton.className = "selectedTool";

        this.toolColor = null;
    }

    chooseCompassTool() {
        this.paintTool = this.compassTool;
        let compassButton = document.getElementById("compassTool");

        this.setButtonsToNormal();

        if (compassButton != null)
            compassButton.className = "selectedTool";

        this.toolColor = null;
    }

    chooseFilledCircleTool() {
        this.paintTool = this.filledCircleTool;
        let compassButton = document.getElementById("filledCircleTool");

        this.setButtonsToNormal();

        if (compassButton != null)
            compassButton.className = "selectedTool";

        this.toolColor = null;
    }

    chooseSquareTool() {
        this.paintTool = this.squareTool;
        let compassButton = document.getElementById("squareTool");

        this.setButtonsToNormal();

        if (compassButton != null)
            compassButton.className = "selectedTool";

        this.toolColor = null;
    }

    chooseFilledSquareTool() {
        this.paintTool = this.filledSquareTool;
        let compassButton = document.getElementById("filledSquareTool");

        this.setButtonsToNormal();

        if (compassButton != null)
            compassButton.className = "selectedTool";

        this.toolColor = null;
    }

    chooseEraserTool() {
        this.paintTool = this.eraserTool;
        let eraserButton = document.getElementById("eraserTool");

        this.setButtonsToNormal();

        if (eraserButton != null)
            eraserButton.className = "selectedTool";

        this.toolColor = [255, 200, 200, 80];
    }

    chooseBucketTool() {
        this.paintTool = this.bucketTool;
        let bucketButton = document.getElementById("bucketTool");

        this.setButtonsToNormal();

        if (bucketButton != null)
            bucketButton.className = "selectedTool";

        this.toolColor = [255, 200, 200, 80];
    }

    private setButtonsToNormal() {
        let children = this.toolBar.querySelectorAll("button");

        for (let button of children) {
            button.className = "";
        }
    }
}
