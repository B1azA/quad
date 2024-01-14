import { TinyColor, fromRatio } from "@ctrl/tinycolor";
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
    private primaryButtonIndex: number = 0;
    private secondaryButtonIndex: number = 1;
    private isColorPrimary: boolean = true;

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
        this.recreateButtonsTable();
    }

    getButton(index: number) {
        return this.buttons[index];
    }

    getPrimaryButton() {
        return this.getButton(this.primaryButtonIndex);
    }

    getSecondaryButton() {
        return this.getButton(this.secondaryButtonIndex);
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

        this.getPrimaryButton().style.backgroundColor = clr;
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

        this.getSecondaryButton().style.backgroundColor = clr;
    }

    setColorToPrimary() {
        this.color = this.primaryColor;
        this.isColorPrimary = true;
    }

    setColorToSecondary() {
        this.color = this.secondaryColor;
        this.isColorPrimary = false;
    }

    getColor() {
        return this.color;
    }

    // remove buttons and table children from DOM, then recreate them and set primary, secondary button
    recreateButtonsTable() {
        this.buttons = [];
        this.rows.forEach((row) => { row.remove(); })
        let rows = Math.ceil(this.colors.length / 5);
        for (let y = 0; y < rows; y++) {
            let tr = <HTMLTableRowElement>document.createElement("tr");
            for (let x = 0; x < 5; x++) {
                let index = y * 5 + x;
                if (index >= this.colors.length) break;

                let td = <HTMLTableCellElement>document.createElement("td");
                let button = <HTMLButtonElement>document.createElement("button");
                button.id = "normalColorButton";
                this.buttons.push(button);
                let color = new TinyColor();


                color.r = this.colors[index][0];
                color.g = this.colors[index][1];
                color.b = this.colors[index][2];

                button.style.backgroundColor = color.toRgbString();

                let clr: [number, number, number, number] = [color.r, color.g, color.b, 255];
                button.onmousedown = (event) => this.colorButtonOnMouseDown(event, button, clr, x + y * 5);

                td.appendChild(button);
                tr.appendChild(td);
            }

            this.rows.push(tr);
            this.table.appendChild(tr);
        }

        this.getSecondaryButton().id = "secondaryColorButton";
        this.getPrimaryButton().id = "primaryColorButton";
    }

    // update color pickers colors and the current color
    updateColors() {
        let primary = new TinyColor(this.getPrimaryButton().style.backgroundColor);
        this.setPrimaryColor([primary.r, primary.g, primary.b, 255]);
        let secondary = new TinyColor(this.getSecondaryButton().style.backgroundColor);
        this.setSecondaryColor([secondary.r, secondary.g, secondary.b, 255]);
        if (this.isColorPrimary) {
            this.color = this.primaryColor;
        } else {
            this.color = this.secondaryColor;
        }
    }

    addColor() {
        this.colors.splice(this.primaryButtonIndex + 1, 0, [255, 255, 255, 255]);

        // move the secondary button index so it is on the same color
        if (this.secondaryButtonIndex > this.primaryButtonIndex && this.secondaryButtonIndex) {
            this.secondaryButtonIndex += 1;
        }

        this.recreateButtonsTable();
    }

    removeColor() {
        let length = this.buttons.length;

        if (length > 2) {
            this.colors.splice(this.primaryButtonIndex, 1,);

            // move with buttons if they are out of bounds or they overlap
            if (this.primaryButtonIndex == length - 1) {
                this.primaryButtonIndex -= 1;
            }

            if (this.secondaryButtonIndex == length - 1) {
                this.secondaryButtonIndex -= 1;
            } else if (this.secondaryButtonIndex > 0) {
                this.secondaryButtonIndex -= 1;
            }

            if (this.primaryButtonIndex == this.secondaryButtonIndex) {
                if (this.primaryButtonIndex < length - 2) {
                    this.primaryButtonIndex += 1;
                } else if (this.primaryButtonIndex > 0) {
                    this.primaryButtonIndex -= 1;
                }
            }

            this.recreateButtonsTable();
            this.updateColors();
        }
    }

    duplicateColor() {
        this.colors.splice(this.primaryButtonIndex + 1, 0, this.primaryColor);

        // move the secondary button index so it is on the same color
        if (this.secondaryButtonIndex > this.primaryButtonIndex && this.secondaryButtonIndex) {
            this.secondaryButtonIndex += 1;
        }

        this.recreateButtonsTable();
    }

    moveColorLeft() {
        if (this.primaryButtonIndex > 0) {
            // switch colors
            let a = this.colors[this.primaryButtonIndex];
            let b = this.colors[this.primaryButtonIndex - 1];
            this.colors[this.primaryButtonIndex - 1] = a;
            this.colors[this.primaryButtonIndex] = b;

            this.primaryButtonIndex -= 1;
            // move the secondary button
            if (this.secondaryButtonIndex == this.primaryButtonIndex && this.secondaryButtonIndex < this.buttons.length - 1) {
                this.secondaryButtonIndex += 1;
            }

            this.recreateButtonsTable();
            this.updateColors();
        }
    }

    moveColorRight() {
        if (this.primaryButtonIndex < this.buttons.length - 1) {
            // switch colors
            let a = this.colors[this.primaryButtonIndex];
            let b = this.colors[this.primaryButtonIndex + 1];
            this.colors[this.primaryButtonIndex + 1] = a;
            this.colors[this.primaryButtonIndex] = b;

            this.primaryButtonIndex += 1;
            // move the secondary button
            if (this.secondaryButtonIndex == this.primaryButtonIndex && this.secondaryButtonIndex > 0) {
                this.secondaryButtonIndex -= 1;
            }

            this.recreateButtonsTable();
            this.updateColors();
        }
    }

    private colorButtonOnMouseDown(event: MouseEvent, button: HTMLButtonElement, color: [number, number, number, number], index: number) {
        if (event.button == 0) {
            if (button.id != "secondaryColorButton") {
                for (let button of this.buttons) {
                    if (button.id != "secondaryColorButton")
                        button.id = "normalColorButton";
                }
                button.id = "primaryColorButton";
                this.primaryButtonIndex = index;
                this.setPrimaryColor(color);
            }
        } else if (event.button == 2) {
            if (button.id != "primaryColorButton") {
                for (let button of this.buttons) {
                    if (button.id != "primaryColorButton")
                        button.id = "normalColorButton";
                }
                button.id = "secondaryColorButton";
                this.secondaryButtonIndex = index;
                this.setSecondaryColor(color);
            }
        }
    }
}
