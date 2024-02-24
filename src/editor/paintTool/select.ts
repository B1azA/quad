import { PaintTool } from "./paintTool";
import { Editor } from "../editor";
import { PaintStep, PaintMiniStep } from "../steps/paintStep";
import { Layer } from "../canvas/layer";

export class Select implements PaintTool {
    lastCoords = { x: -1, y: -1 };
    step: PaintStep | null = null;
    selected = false;
    selectedRegion = { x1: 0, y1: 0, x2: 0, y2: 0 };
    selectedRegionData: [number, number, number, number][][] = [[]];

    onMouseDown(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
        button: number,
    ) {
        let layerID = layer.getID();
        this.step = new PaintStep(layerID);

        this.lastCoords = coords;

        switch (button) {
            case 0:
                this.selected = false;
                break;
            case 2:
                this.selected = true;

                // update the selected region
                let image = layer.getImage();
                let template = editor.getCurrentCanvas().getTemplate();
                let templateImage = template.getImage();
                let length = (this.selectedRegion.x2 - this.selectedRegion.x1 + 1) * (this.selectedRegion.y2 - this.selectedRegion.y1 + 1);
                this.selectedRegionData = new Array(length)
                    .fill([0, 0, 0, 255])
                    .map(() =>
                        new Array(length).fill([0, 0, 0, 255])
                    );

                let ministeps = [];

                // fill the region data
                for (let x = 0; x <= this.selectedRegion.x2 - this.selectedRegion.x1; x++) {
                    for (let y = 0; y <= this.selectedRegion.y2 - this.selectedRegion.y1; y++) {
                        let point = { x: x + this.selectedRegion.x1, y: y + this.selectedRegion.y1 };
                        let clr = image.getPixel(point);
                        image.putPixel(point, [0, 0, 0, 0]);
                        templateImage.putPixel(point, clr);
                        this.selectedRegionData[x][y] = clr;

                        ministeps.push(new PaintMiniStep(point, clr));
                    }
                }
                this.step.addMiniSteps(ministeps);
                layer.setImage(image);
                template.setImage(templateImage);

                this.drawBorder(
                    { x: this.selectedRegion.x1 - 1, y: this.selectedRegion.y1 - 1 },
                    { x: this.selectedRegion.x2 + 1, y: this.selectedRegion.y2 + 1 },
                    editor.tools.getSelectColor(),
                    editor.getCurrentCanvas().getTemplate(),
                );
                break;
        }
    }

    onMouseUp(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        if (this.selected) {
            let ministeps = [];
            let image = layer.getImage();
            for (let x = 0; x <= this.selectedRegion.x2 - this.selectedRegion.x1; x++) {
                for (let y = 0; y <= this.selectedRegion.y2 - this.selectedRegion.y1; y++) {
                    let clr = this.selectedRegionData[x][y];
                    if (clr[3] > 0) {
                        let point = { x: x + this.selectedRegion.x1, y: y + this.selectedRegion.y1 };
                        let stepColor = image.getPixel(point);
                        image.putPixel(point, clr);

                        ministeps.push(new PaintMiniStep(point, stepColor));
                    }
                }
            }

            this.step?.addMiniSteps(ministeps);
            layer.setImage(image);
        }

        if (this.step != null && !this.step.isEmpty()) {
            editor.getCurrentCanvas().steps.addStep(this.step);
        }
    }

    onMouseMove(
        editor: Editor,
        coords: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        if (!this.selected) {
            editor.getCurrentCanvas().getTemplate().clear();
            this.selectedRegion = this.drawBorder(
                this.lastCoords,
                coords,
                editor.tools.getSelectColor(),
                editor.getCurrentCanvas().getTemplate(),
            );
        } else {
            let deltaX = coords.x - this.lastCoords.x;
            let deltaY = coords.y - this.lastCoords.y;

            this.selectedRegion.x1 += deltaX;
            this.selectedRegion.x2 += deltaX;
            this.selectedRegion.y1 += deltaY;
            this.selectedRegion.y2 += deltaY;

            this.lastCoords = coords;

            let template = editor.getCurrentCanvas().getTemplate();
            let templateImage = template.getImage();
            for (let x = 0; x <= this.selectedRegion.x2 - this.selectedRegion.x1; x++) {
                for (let y = 0; y <= this.selectedRegion.y2 - this.selectedRegion.y1; y++) {
                    let clr = this.selectedRegionData[x][y];
                    templateImage.putPixel({ x: x + this.selectedRegion.x1, y: y + this.selectedRegion.y1 }, clr);
                }
            }

            template.setImage(templateImage);

            this.drawBorder(
                { x: this.selectedRegion.x1 - 1, y: this.selectedRegion.y1 - 1 },
                { x: this.selectedRegion.x2 + 1, y: this.selectedRegion.y2 + 1 },
                editor.tools.getSelectColor(),
                editor.getCurrentCanvas().getTemplate(),
            );
        }
    }

    drawBorder(
        a: { x: number, y: number },
        b: { x: number, y: number },
        color: [number, number, number, number],
        layer: Layer,
    ) {
        let image = layer.getImage();
        let size = image.size;

        let a2 = { x: 0, y: 0 };
        let b2 = { x: 0, y: 0 };

        a2.x = Math.min(a.x, b.x);
        a2.y = Math.min(a.y, b.y);
        b2.x = Math.max(a.x, b.x);
        b2.y = Math.max(a.y, b.y);

        a2.x = a2.x < 0 ? -1 : a2.x;
        a2.x = a2.x > size.width ? size.width : a2.x;
        a2.y = a2.y < 0 ? -1 : a2.y;
        a2.y = a2.y > size.height ? size.height : a2.y;

        b2.x = b2.x < 0 ? -1 : b2.x;
        b2.x = b2.x > size.width ? size.width : b2.x;
        b2.y = b2.y < 0 ? -1 : b2.y;
        b2.y = b2.y > size.height ? size.height : b2.y;

        for (let x = a2.x; x <= b2.x; x++) {
            if (x % 2 == 0) {
                let point1 = { x: x, y: a2.y };
                let point2 = { x: x, y: b2.y };
                image.putPixel(point1, color);
                image.putPixel(point2, color);
            }
        }

        for (let y = a2.y; y <= b2.y; y++) {
            if (y % 2 == 0) {
                let point1 = { x: a2.x, y: y };
                let point2 = { x: b2.x, y: y };
                image.putPixel(point1, color);
                image.putPixel(point2, color);
            }
        }

        layer.setImage(image);

        return {
            x1: a2.x + 1,
            y1: a2.y + 1,
            x2: b2.x - 1,
            y2: b2.y - 1,
        }
    }
}
