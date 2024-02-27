import { PaintTool } from "./paintTool/paintTool";
import { Pen } from "./paintTool/pen";
import { Ruler } from "./paintTool/ruler";
import { Compass } from "./paintTool/compass";
import { FilledCircle } from "./paintTool/filledCircle";
import { Square } from "./paintTool/square";
import { FilledSquare } from "./paintTool/filledSquare";
import { Eraser } from "./paintTool/eraser";
import { RectangleEraser } from "./paintTool/rectangleEraser";
import { Bucket } from "./paintTool/bucket";
import { Picker } from "./paintTool/picker";
import { Select } from "./paintTool/select";

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
    readonly rectangleEraserTool: PaintTool = new RectangleEraser;
    readonly bucketTool: PaintTool = new Bucket;
    readonly pickerTool: PaintTool = new Picker;
    readonly selectTool: PaintTool = new Select;
    private toolColor: [number, number, number, number] | null = null;
    private selectColor: [number, number, number, number] = [200, 200, 255, 120];

    getPaintTool() {
        return this.paintTool;
    }

    getToolColor() {
        return this.toolColor;
    }

    setSelectColor(color: [number, number, number, number]) {
        this.selectColor = color;
    }

    getSelectColor() {
        return this.selectColor;
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

        this.toolColor = this.selectColor;
    }

    chooseRectangleEraserTool() {
        this.paintTool = this.rectangleEraserTool;
        let rectangleEraserButton = document.getElementById("rectangleEraserTool");

        this.setButtonsToNormal();

        if (rectangleEraserButton != null)
            rectangleEraserButton.className = "selectedTool";

        this.toolColor = this.selectColor;
    }

    chooseBucketTool() {
        this.paintTool = this.bucketTool;
        let bucketButton = document.getElementById("bucketTool");

        this.setButtonsToNormal();

        if (bucketButton != null)
            bucketButton.className = "selectedTool";

        this.toolColor = null;
    }

    choosePickerTool() {
        this.paintTool = this.pickerTool;
        let pickerButton = document.getElementById("pickerTool");

        this.setButtonsToNormal();

        if (pickerButton != null)
            pickerButton.className = "selectedTool";

        this.toolColor = null;
    }

    chooseSelectTool() {
        this.paintTool = this.selectTool;
        let selectButton = document.getElementById("selectTool");

        this.setButtonsToNormal();

        if (selectButton != null)
            selectButton.className = "selectedTool";

        this.toolColor = this.selectColor;
    }

    private setButtonsToNormal() {
        let children = this.toolBar.querySelectorAll("button");

        for (let button of children) {
            button.className = "";
        }
    }
}
