import { showPromptDialog } from "../dialog";
import { Steps } from "../steps/steps";
import { Image } from "./image";
import { Layer } from "./layer";

export class Canvas {
    private layers: Layer[] = [];
    private editorContainer = document.getElementById("editorContainer")!;
    private layerBar = document.getElementById("layerBar")!;
    private layerRangeBar = document.getElementById("layerRangeBar")!;

    // there is one less element than in the layers
    // because there is no button and range for the template
    private layerButtons: HTMLButtonElement[] = [];
    private layerRanges: HTMLInputElement[] = [];

    // original width and height of the canvas
    private originalRealWidth: number;
    private originalRealHeight: number;

    private zoom: number = 1;

    private layer: number = 1;

    steps: Steps = new Steps();

    private frame: HTMLCanvasElement;

    private layerImagesSave: Image[] = [];

    constructor(frameContainer: HTMLElement, size: { width: number, height: number }) {
        let height = (window.innerHeight / 2);
        let width = height * size.width / size.height;
        let realSize = { width, height };
        let pos = {
            x: window.innerWidth / 2 - width / 2,
            y: window.innerHeight / 2 - height / 2
        };

        this.originalRealWidth = width;
        this.originalRealHeight = height;

        this.setLayer(1);

        let frame = document.createElement("canvas");
        frame.width = width;
        frame.height = height;
        frame.className = "normalFrame";
        this.frame = frame;
        frameContainer.appendChild(frame);
    }

    init(
        template: Layer,
        originalRealWidth: number,
        originalRealHeight: number,
    ) {
        this.originalRealWidth = originalRealWidth;
        this.originalRealHeight = originalRealHeight;

        if (this.layers.length <= 0) {
            this.layers.push(template);
        }

        this.setSize(template.getSize());
        this.setRealSize(template.getRealSize());
        this.setPos(template.getPos());

        // create a new layer if there is not one
        // else add old layers and set saves to them
        if (this.layers.length == 1) {
            this.addLayer("main");
        } else {
            for (let i = 1; i < this.layers.length; i++) {
                this.initLayer(i);
                let image = this.layerImagesSave[i - 1];
                if (image != undefined && image != null) {
                    this.layers[i].setImage(image);
                }
            }
        }

        this.setLayer(this.layer);
    }

    remove() {
        this.layerImagesSave = [];
        for (let i = 1; i < this.layers.length; i++) {
            // save data of layers
            this.layerImagesSave.push(this.layers[i].getImage());

            this.layers[i].getCanvasElement().remove();
            this.layerButtons[i - 1].parentElement?.remove();
            this.layerRanges[i - 1].parentElement?.remove();
        }

        return this.getTemplate();
    }

    getFrame() {
        return this.frame;
    }

    getOriginalRealWidth() {
        return this.originalRealWidth;
    }

    getOriginalRealHeight() {
        return this.originalRealHeight;
    }

    setSize(size: { width: number, height: number }) {
        for (let layer of this.layers) {
            layer.setSize(size);
        }
    }

    getSize() {
        return this.layers[0].getSize();
    }

    setRealSize(size: { width: number, height: number }) {
        for (let layer of this.layers) {
            layer.setRealSize(size);
        }
    }

    getRealSize() {
        return this.layers[0].getRealSize();
    }

    setPos(pos: { x: number, y: number }) {
        for (let layer of this.layers) {
            layer.setPos(pos);
        }
    }

    getPos() {
        return this.layers[0].getPos();
    }

    getBoundingClientRect() {
        return this.layers[0].getBoundingClientRect();
    }

    getCurrentLayerIndex() {
        return this.layer;
    }

    getLayer(index: number) {
        if (index < this.getLayersLength()) {
            return this.layers[index];
        } else {
            return null;
        }
    }

    getTemplate() {
        return this.layers[0];
    }

    getCurrentLayer() {
        return this.layers[this.layer];
    }

    getLayersLength() {
        return this.layers.length;
    }

    addTemplate(
        size: { width: number, height: number },
        realSize: { width: number, height: number },
        pos: { x: number, y: number },
    ) {
        this.layers.push(new Layer(
            "template",
            100,
            size,
            realSize,
            pos,
            true
        ));
    }

    addLayer(name: string) {
        let layer = new Layer(
            name,
            100,
            this.getSize(),
            this.getRealSize(),
            this.getPos(),
            false
        );
        this.addCustomLayer(layer)
    }

    addCustomLayer(layer: Layer) {
        if (this.getLayersLength() > 0) {
            this.layers.push(layer);

            let index = this.layers.length - 1;

            let li = document.createElement("li");
            let layerButton = document.createElement("button");
            layerButton.id = index.toString();
            layerButton.textContent = layer.getName();

            // change the layer on click
            layerButton.onclick = (e) => {
                let target = <HTMLButtonElement>e.target;
                let layer = parseInt(target.id);
                this.setLayer(layer);
            }

            // rename on double click
            layerButton.ondblclick = (e) => {
                let target = <HTMLButtonElement>e.target;
                let def = target.textContent;
                if (def == null) def = "unnamed";

                showPromptDialog("Rename layer", def, (value) => {
                    let name = value.length > 0 ? value : "unnamed";
                    target.textContent = name;
                    layer.setName(name);
                });
            }

            li.appendChild(layerButton);
            this.layerBar.appendChild(li);
            this.layerButtons.push(layerButton);

            // set an opacity slider
            let layerOpacityRange = document.createElement("input");
            layerOpacityRange.type = "range";
            layerOpacityRange.min = "0";
            layerOpacityRange.max = "100";
            layerOpacityRange.value = layer.getOpacity().toString();

            layerOpacityRange.oninput = () => {
                // + 0.2 so it can be always seen
                layerButton.style.opacity = (parseInt(layerOpacityRange.value) / 100 + 0.2).toString();
                layer.setOpacity(parseInt(layerOpacityRange.value));
            }

            let opacityLi = document.createElement("li");
            opacityLi.appendChild(layerOpacityRange);
            this.layerRangeBar.appendChild(opacityLi);
            this.layerRanges.push(layerOpacityRange);

            this.setLayer(index);

            layer.init(this.editorContainer);
        }
    }

    initLayer(layerIndex: number) {
        if (layerIndex > 0) {
            this.layers[layerIndex].init(this.editorContainer);

            let li = document.createElement("li");
            li.appendChild(this.layerButtons[layerIndex - 1]);
            this.layerBar.appendChild(li);

            let opacityLi = document.createElement("li");
            opacityLi.appendChild(this.layerRanges[layerIndex - 1]);
            this.layerRangeBar.appendChild(opacityLi);
        }





        // if (this.getLayersLength() > 0) {
        //     let index = this.layers.length - 1;
        //
        //     let li = document.createElement("li");
        //     let layerButton = document.createElement("button");
        //     layerButton.id = index.toString();
        //     layerButton.textContent = layer.getName();
        //
        //     // change the layer on click
        //     layerButton.onclick = (e) => {
        //         let target = <HTMLButtonElement>e.target;
        //         let layer = parseInt(target.id);
        //         this.setLayer(layer);
        //     }
        //
        //     // rename on double click
        //     layerButton.ondblclick = (e) => {
        //         let target = <HTMLButtonElement>e.target;
        //         let def = target.textContent;
        //         if (def == null) def = "unnamed";
        //
        //         showPromptDialog("Rename layer", def, (value) => {
        //             let name = value.length > 0 ? value : "unnamed";
        //             target.textContent = name;
        //             layer.setName(name);
        //         });
        //     }
        //
        //     li.appendChild(layerButton);
        //     this.layerBar.appendChild(li);
        //     this.layerButtons.push(layerButton);
        //
        //     // set an opacity slider
        //     let layerOpacityRange = document.createElement("input");
        //     layerOpacityRange.type = "range";
        //     layerOpacityRange.min = "0";
        //     layerOpacityRange.max = "100";
        //     layerOpacityRange.value = layer.getOpacity().toString();
        //
        //     layerOpacityRange.oninput = () => {
        //         // + 0.2 so it can be always seen
        //         layerButton.style.opacity = (parseInt(layerOpacityRange.value) / 100 + 0.2).toString();
        //         layer.setOpacity(parseInt(layerOpacityRange.value));
        //     }
        //
        //     let opacityLi = document.createElement("li");
        //     opacityLi.appendChild(layerOpacityRange);
        //     this.layerRangeBar.appendChild(opacityLi);
        //     this.layerRanges.push(layerOpacityRange);
        //
        //     layer.init(this.editorContainer);
        // }
    }

    addCustomLayerAtIndex(layer: Layer, layerIndex: number) {
        this.addCustomLayer(layer);

        let index = this.getLayersLength() - 1;
        while (index != layerIndex) {
            this.moveLayerUp();
            index--;
        }
    }

    getLayerByID(id: string) {
        for (let i = 1; i < this.layers.length; i++) {
            let layerID = this.layers[i].getCanvasElement().id;
            if (layerID == id) {
                return this.layers[i];
            }
        }

        return null;
    }

    getLayerByName(name: string) {
        for (let i = 1; i < this.layers.length; i++) {
            if (this.layers[i].getName() == name) {
                return this.layers[i];
            }
        }

        return null;
    }

    getLayerByIndex(layerIndex: number) {
        if (layerIndex > 0 && layerIndex < this.layers.length) {
            return this.layers[layerIndex];
        }
        return null;
    }

    getLayerIndexByID(id: string) {
        for (let i = 1; i < this.layers.length; i++) {
            let layerID = this.layers[i].getCanvasElement().id;
            if (layerID == id) {
                return i;
            }
        }

        return null;
    }

    removeLayer(layerIndex: number) {
        let layer = layerIndex;

        // > 2 so at least one layer and the template exists
        if (layer > 0 && layer && this.layers.length > 2) {
            // remove elements from DOM
            let max = this.layerButtons.length;
            for (let i = 0; i < max; i++) {
                this.layerButtons[i].parentElement?.remove();
                this.layerRanges[i].parentElement?.remove();
            }

            let newLayerButtons = [];
            let newLayerRanges = [];
            for (let i = 0; i < max; i++) {
                if (i < layer - 1) {
                    let button = this.layerButtons[i];
                    button.id = (i + 1).toString();
                    newLayerButtons.push(button);

                    let range = this.layerRanges[i];
                    newLayerRanges.push(range);
                } else if (i > layer - 1) {
                    let button = this.layerButtons[i];
                    button.id = i.toString();
                    newLayerButtons.push(button);

                    let range = this.layerRanges[i];
                    newLayerRanges.push(range);
                }
            }

            this.layerButtons = newLayerButtons;
            this.layerRanges = newLayerRanges;

            // remove an editor layer
            this.layers[layer].getCanvasElement().remove();
            this.layers.splice(layer, 1);

            // return elements back
            for (let i = 0; i < this.layerButtons.length; i++) {
                let li = document.createElement("li");
                li.appendChild(this.layerButtons[i]);
                this.layerBar.appendChild(li);

                let liRange = document.createElement("li");
                liRange.appendChild(this.layerRanges[i]);
                this.layerRangeBar.appendChild(liRange);
            }

            // change layer if it does not exist anymore
            if (this.layer >= this.layers.length) {
                this.setLayer(this.layers.length - 1);
            } else if (this.layer <= 1) {
                this.setLayer(1);
            }
        }
    }

    removeCurrentLayer() {
        this.removeLayer(this.layer);
    }

    moveLayerUp() {
        let layer = this.layer;

        // do not move if the layer is on top or it is the template
        if (layer > 1) {
            // remove buttons and ranges
            for (let i = 0; i < this.layerButtons.length; i++) {
                this.layerButtons[i].parentElement?.remove();
                this.layerRanges[i].parentElement?.remove();
            }

            // move layer up
            let currentIndex = layer - 1;
            let oneUpIndex = layer - 2;

            //switch buttons
            let currentButton = this.layerButtons[currentIndex];
            let oneUpButton = this.layerButtons[oneUpIndex];
            let oneUpId = oneUpButton.id;
            oneUpButton.id = currentButton.id;
            currentButton.id = oneUpId;
            this.layerButtons[currentIndex] = oneUpButton;
            this.layerButtons[oneUpIndex] = currentButton;

            // switch ranges
            let currentRange = this.layerRanges[currentIndex];
            let oneUpRange = this.layerRanges[oneUpIndex];
            this.layerRanges[currentIndex] = oneUpRange;
            this.layerRanges[oneUpIndex] = currentRange;

            // switch layers and ctxs
            let currentLayerIndex = currentIndex + 1;
            let oneUpLayerIndex = oneUpIndex + 1;

            let currentLayer = this.layers[currentLayerIndex];
            let oneUpLayer = this.layers[oneUpLayerIndex];
            this.layers[currentLayerIndex] = oneUpLayer;
            this.layers[oneUpLayerIndex] = currentLayer;

            // return buttons and ranges
            for (let i = 0; i < this.layerButtons.length; i++) {
                let li = document.createElement("li");
                li.appendChild(this.layerButtons[i]);
                this.layerBar.appendChild(li);

                // change oninput event so it changes opacity of the right layer
                this.layerRanges[i].oninput = () => {
                    // + 0.2 so it can be always seen
                    this.layerButtons[i].style.opacity = (parseInt(this.layerRanges[i].value) / 100 + 0.2).toString();
                    this.layers[i + 1].getCanvasElement().style.opacity = (parseInt(this.layerRanges[i].value) / 100).toString();
                }

                let liRange = document.createElement("li");
                liRange.appendChild(this.layerRanges[i]);
                this.layerRangeBar.appendChild(liRange);
            }

            this.setLayer(layer - 1);

            return true;
        }

        return false;
    }

    moveLayerDown() {
        let layer = this.layer;

        // do not move if the layer is on top or it is the template
        if (layer > 0 && layer < this.layers.length - 1) {
            // remove buttons and ranges
            for (let i = 0; i < this.layerButtons.length; i++) {
                this.layerButtons[i].parentElement?.remove();
                this.layerRanges[i].parentElement?.remove();
            }

            // move layer up
            let currentIndex = layer - 1;
            let oneDownIndex = layer;

            //switch buttons
            let currentButton = this.layerButtons[currentIndex];
            let oneDownButton = this.layerButtons[oneDownIndex];
            let oneDownId = oneDownButton.id;
            oneDownButton.id = currentButton.id;
            currentButton.id = oneDownId;
            this.layerButtons[currentIndex] = oneDownButton;
            this.layerButtons[oneDownIndex] = currentButton;

            // switch ranges
            let currentRange = this.layerRanges[currentIndex];
            let oneDownRange = this.layerRanges[oneDownIndex];
            this.layerRanges[currentIndex] = oneDownRange;
            this.layerRanges[oneDownIndex] = currentRange;

            // switch layers and ctxs
            let currentLayerIndex = currentIndex + 1;
            let oneDownLayerIndex = oneDownIndex + 1;

            let currentLayer = this.layers[currentLayerIndex];
            let oneDownLayer = this.layers[oneDownLayerIndex];
            this.layers[currentLayerIndex] = oneDownLayer;
            this.layers[oneDownLayerIndex] = currentLayer;

            // return buttons and ranges
            for (let i = 0; i < this.layerButtons.length; i++) {
                let li = document.createElement("li");
                li.appendChild(this.layerButtons[i]);
                this.layerBar.appendChild(li);

                // change oninput event so it changes opacity of the right layer
                this.layerRanges[i].oninput = () => {
                    // + 0.2 so it can be always seen
                    this.layerButtons[i].style.opacity = (parseInt(this.layerRanges[i].value) / 100 + 0.2).toString();
                    this.layers[i + 1].getCanvasElement().style.opacity = (parseInt(this.layerRanges[i].value) / 100).toString();
                }

                let liRange = document.createElement("li");
                liRange.appendChild(this.layerRanges[i]);
                this.layerRangeBar.appendChild(liRange);
            }

            this.setLayer(layer + 1);

            return true;
        }

        return false;
    }

    setLayer(layer: number) {
        let length = this.layers.length;

        // change layers zIndex so the template is on the current layer
        if (length > layer) {
            this.layer = layer;

            // higher layers
            for (let i = 1; i < layer; i++) {
                this.layers[i].getCanvasElement().style.zIndex = "4";
            }

            // current layer
            this.layers[layer].getCanvasElement().style.zIndex = "2";

            // lower layers
            for (let i = layer + 1; i < length; i++) {
                this.layers[i].getCanvasElement().style.zIndex = "1";
            }

            // remove and add layers so they are in corect order and therefor display correctly
            for (let i = length - 1; i > 0; i--) {
                let l = this.layers[i];
                l.getCanvasElement().remove();
                this.editorContainer.appendChild(l.getCanvasElement());
            }

            // set id
            this.layerButtons.forEach((button) => {
                button.classList.remove("currentLayerBtn");
            });
            this.layerButtons[layer - 1].classList.add("currentLayerBtn");
        }
    }

    // clear all layers
    clearAll() {
        for (let layer of this.layers) {
            layer.clear();
        }
    }

    // mouse position relative to the canvas
    getMousePosition(event: MouseEvent) {
        let rect = this.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        return {
            'x': x,
            'y': y,
        };
    }

    // mouse coordinates relative to the canvas (pixel coordinates)
    getMouseCoords(event: MouseEvent) {
        let mousePos = this.getMousePosition(event);
        let size = this.getSize();
        let realSize = this.getRealSize();

        let x = Math.ceil(size.width * mousePos.x / realSize.width) - 1;
        let y = Math.ceil(size.height * mousePos.y / realSize.height) - 1;

        return {
            'x': x,
            'y': y,
        };
    }

    // imageData from the canvas
    getLayerBytes(layer: number) {
        let size = this.getSize();

        let imageData = this.layers[layer].getCtx().getImageData(0, 0, size.width, size.height);
        let data: number[] = new Array(imageData.data.length);

        for (let i = 0; i < imageData.data.length; i++) {
            data[i] = imageData.data[i];
        }

        return data;
    }

    // center position of the canvas
    getCenterPos() {
        let pos = this.getPos();
        let realSize = this.getRealSize();
        let center = {
            x: pos.x + realSize.width / 2,
            y: pos.y + realSize.height / 2
        };

        return center;
    }

    // scale the canvas, zoom out when input is negative
    zoomIn(zoom_delta: number) {
        let center = this.getCenterPos();

        this.zoom += zoom_delta;
        if (this.zoom < 0.1) {
            this.zoom = 0.1;
        }

        let width = this.originalRealWidth * this.zoom;
        let height = this.originalRealHeight * this.zoom;
        this.setRealSize({ width, height });

        this.moveCenterTo(center);
    }

    // move the canvas by delta
    move(moveDelta: { x: number, y: number }) {
        let pos = this.getPos();
        let x = pos.x - moveDelta.x;
        let y = pos.y - moveDelta.y;

        this.setPos({ x, y });
    }

    // move the canvas center to position
    moveCenterTo(pos: { x: number, y: number }) {
        let realSize = this.getRealSize();

        let x = pos.x - realSize.width / 2;
        let y = pos.y - realSize.height / 2;

        this.setPos({ x, y });
    }
}
