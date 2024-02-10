import { PaintTool } from "./paintTool/paintTool";
import { Pen } from "./paintTool/pen";
import { Ruler } from "./paintTool/ruler";
import { Compass } from "./paintTool/compass";
import { FilledCircle } from "./paintTool/filledCircle";
import { Square } from "./paintTool/square";
import { FilledSquare } from "./paintTool/filledSquare";

export class PaintTools {
    private toolBar = <HTMLElement>document.getElementById("toolBar");
    private paintTool: PaintTool = new Pen;
    readonly penTool: PaintTool = new Pen;
    readonly rulerTool: PaintTool = new Ruler;
    readonly compassTool: PaintTool = new Compass;
    readonly filledCircleTool: PaintTool = new FilledCircle;
    readonly squareTool: PaintTool = new Square;
    readonly filledSquareTool: PaintTool = new FilledSquare;

    getPaintTool() {
        return this.paintTool;
    }

    choosePenTool() {
        this.paintTool = this.penTool;
        let penButton = document.getElementById("penTool");
        console.log(penButton);

        this.setButtonsToNormal();

        if (penButton != null)
            penButton.className = "selectedTool";
    }

    chooseRulerTool() {
        this.paintTool = this.rulerTool;
        let rulerButton = document.getElementById("rulerTool");

        this.setButtonsToNormal();

        if (rulerButton != null)
            rulerButton.className = "selectedTool";
    }

    chooseCompassTool() {
        this.paintTool = this.compassTool;
        let compassButton = document.getElementById("compassTool");

        this.setButtonsToNormal();

        if (compassButton != null)
            compassButton.className = "selectedTool";
    }

    chooseFilledCircleTool() {
        this.paintTool = this.filledCircleTool;
        let compassButton = document.getElementById("filledCircleTool");

        this.setButtonsToNormal();

        if (compassButton != null)
            compassButton.className = "selectedTool";
    }

    chooseSquareTool() {
        this.paintTool = this.squareTool;
        let compassButton = document.getElementById("squareTool");

        this.setButtonsToNormal();

        if (compassButton != null)
            compassButton.className = "selectedTool";
    }

    chooseFilledSquareTool() {
        this.paintTool = this.filledSquareTool;
        let compassButton = document.getElementById("filledSquareTool");

        this.setButtonsToNormal();

        if (compassButton != null)
            compassButton.className = "selectedTool";
    }

    private setButtonsToNormal() {
        let children = this.toolBar.querySelectorAll("button");

        for (let button of children) {
            button.className = "";
        }
    }
}
