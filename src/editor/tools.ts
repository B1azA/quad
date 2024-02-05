import { PaintTool } from "./paintTool/paintTool";
import { Pen } from "./paintTool/pen";
import { Ruler } from "./paintTool/ruler";
import { Compass } from "./paintTool/compass";
import { Square } from "./paintTool/square";

export class Tools {
    private toolBar = <HTMLElement>document.getElementById("toolBar");
    private paintTool: PaintTool = new Pen;
    readonly penTool: PaintTool = new Pen;
    readonly rulerTool: PaintTool = new Ruler;
    readonly compassTool: PaintTool = new Compass;
    readonly squareTool: PaintTool = new Square;

    constructor() {

    }

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


    private setButtonsToNormal() {
        for (let child of this.toolBar.children) {
            let button = child.querySelector("button");
            if (button != null)
                button.className = "";
        }
    }
}
