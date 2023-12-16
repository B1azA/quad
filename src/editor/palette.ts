import { TinyColor, fromRatio } from "@ctrl/tinycolor";
import Coloris from "@melloware/coloris";
import { Editor } from "./editor";

export class Palette {
    private table = <HTMLTableElement>document.getElementById("paletteTable");
    private colors: [number, number, number, number][] = [];
    private primaryColorPicker = <HTMLInputElement>document.getElementById("picker1");
    private secondaryColorPicker = <HTMLInputElement>document.getElementById("picker2");
    private primaryColor: [number, number, number, number] = [0, 0, 0, 255];
    private secondaryColor: [number, number, number, number] = [0, 0, 0, 255];
    private color: [number, number, number, number] = [0, 0, 0, 255];
    private buttons: HTMLButtonElement[] = [];
    private rows: HTMLTableRowElement[] = [];
    private primaryButton: HTMLButtonElement;
    private secondaryButton: HTMLButtonElement;

    constructor(editor: Editor, colors: [number, number, number, number][]) {
        this.colors = colors;

        if (colors[0] == null && colors[1] == null) {
            colors[0] = [0, 0, 0, 255];
            colors[1] = [0, 0, 0, 255];
        } else if (colors[0] == null) {
            colors[0] = [0, 0, 0, 255];
        } else if (colors[1] == null) {
            colors[1] = [255, 255, 255, 255];
        }

        this.primaryColor = [
            colors[0][0],
            colors[0][1],
            colors[0][2],
            255
        ];

        this.secondaryColor = [
            colors[1][0],
            colors[1][1],
            colors[1][2],
            255
        ];

        this.color = this.primaryColor;

        this.primaryColorPicker.value = fromRatio({
            r: this.primaryColor[0],
            g: this.primaryColor[1],
            b: this.primaryColor[2],
        }).toHexString();


        this.secondaryColorPicker.value = fromRatio({
            r: this.secondaryColor[0],
            g: this.secondaryColor[1],
            b: this.secondaryColor[2],
        }).toHexString();

        // remove all children of the palette
        for (let child of this.table.children) {
            child.remove();
        }

        // add color buttons
        let i = Math.ceil(colors.length / 5);
        for (let y = 0; y < i; y++) {
            let tr = <HTMLTableRowElement>document.createElement("tr");
            for (let x = 0; x < 5; x++) {
                let td = <HTMLTableDataCellElement>document.createElement("td");
                let button = <HTMLButtonElement>document.createElement("button");
                button.id = "normalColorButton";
                this.buttons.push(button);
                let color = new TinyColor();

                let index = y * 5 + x;
                if (index >= colors.length) break;

                color.r = colors[index][0];
                color.g = colors[index][1];
                color.b = colors[index][2];

                button.style.backgroundColor = color.toRgbString();

                let clr: [number, number, number, number] = [color.r, color.g, color.b, 255];
                button.onmousedown = (event) => this.colorButtonOnMouseDown(event, button, clr);

                td.appendChild(button);
                tr.appendChild(td);
            }

            this.rows.push(tr);
            this.table.appendChild(tr);
        }

        this.buttons[0].id = "primaryColorButton";
        this.buttons[1].id = "secondaryColorButton";
        this.primaryButton = this.buttons[0];
        this.secondaryButton = this.buttons[1];
    }

    setPrimaryColor(color: [number, number, number, number]) {
        this.primaryColor = color;
        let clr = fromRatio({
            r: color[0],
            g: color[1],
            b: color[2],
        }).toHexString();
        this.primaryColorPicker.value = clr;

        let button = this.primaryColorPicker.parentElement?.querySelector("button");
        if (button != null) {
            button.style.color = clr;
        }

        this.primaryButton.style.backgroundColor = clr;
    }

    setSecondaryColor(color: [number, number, number, number]) {
        this.secondaryColor = color;
        let clr = fromRatio({
            r: color[0],
            g: color[1],
            b: color[2],
        }).toHexString();
        this.secondaryColorPicker.value = clr;

        let button = this.secondaryColorPicker.parentElement?.querySelector("button");
        if (button != null) {
            button.style.color = clr;
        }

        this.secondaryButton.style.backgroundColor = clr;
    }

    setColorToPrimary() {
        this.color = this.primaryColor;
    }

    setColorToSecondary() {
        this.color = this.secondaryColor;
    }

    getColor() {
        return this.color;
    }

    addColorButton() {
        let td = <HTMLTableDataCellElement>document.createElement("td");
        let button = <HTMLButtonElement>document.createElement("button");

        let clr: [number, number, number, number] = this.primaryColor;
        this.colors.push(clr);
        let color = fromRatio({
            r: clr[0],
            g: clr[1],
            b: clr[2],
        });

        button.style.backgroundColor = color.toHexString();
        button.id = "normalColorButton";

        button.onmousedown = (event) => this.colorButtonOnMouseDown(event, button, clr);

        if (this.buttons.length % 5 == 0) {
            let tr = <HTMLTableRowElement>document.createElement("tr");
            this.rows.push(tr);
            td.appendChild(button);
            tr.appendChild(td);
            this.table.appendChild(tr);
        } else {
            td.appendChild(button);
            if (this.rows.length > 0) {
                this.rows[this.rows.length - 1].appendChild(td);
            }
        }

        this.buttons.push(button);
    }

    removeColorButton() {
        console.log(this.buttons.length);

        // if it exists, remove row additional row
        if (this.buttons.length % 5 == 1) {
            let row = this.rows.pop();
            row?.remove();
        }
        this.colors.pop();

        let button = this.buttons.pop();
        if (button != null) {
            button.parentElement?.remove();
        }
    }

    private colorButtonOnMouseDown(event: MouseEvent, button: HTMLButtonElement, color: [number, number, number, number]) {
        if (event.button == 0) {
            if (button.id != "secondaryColorButton") {
                for (let button of this.buttons) {
                    if (button.id != "secondaryColorButton")
                        button.id = "normalColorButton";
                }
                button.id = "primaryColorButton";
                this.primaryButton = button;
                this.setPrimaryColor(color);
            }
        } else if (event.button == 2) {
            if (button.id != "primaryColorButton") {
                for (let button of this.buttons) {
                    if (button.id != "primaryColorButton")
                        button.id = "normalColorButton";
                }
                button.id = "secondaryColorButton";
                this.secondaryButton = button;
                this.setSecondaryColor(color);
            }
        }
    }
}
