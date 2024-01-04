import "@melloware/coloris/dist/coloris.css";
import "./styles/styles.scss";
import { Editor } from "./editor/editor";
import { ImageMessage, loadFile, saveFile } from "./tauri";

import Coloris from "@melloware/coloris";
import { TinyColor } from "@ctrl/tinycolor";
import { showPromptDialog } from "./editor/dialog";
import { LayerAddedStep, LayerMovedDownStep, LayerMovedUpStep, LayerRemovedStep } from "./editor/steps/layerStep";
import { Image } from "./editor/canvas/image";


let editor = new Editor({ width: 32, height: 32 });
run();

function run() {
    setup_events(editor);

    // init coloris
    Coloris.init();
    Coloris({
        el: "#picker1",
        theme: "pill",
        themeMode: "dark",
        alpha: false,
        closeButton: true,
        formatToggle: true,
    });

    Coloris({
        el: "#picker2",
    });

    Coloris.setInstance("#picker1", {
        onChange: (color) => {
            let col = new TinyColor(color);
            editor.palette.setPrimaryColor([col.r, col.g, col.b, 255]);
        }
    });

    Coloris.setInstance("#picker2", {
        onChange: (color) => {
            let col = new TinyColor(color);
            editor.palette.setSecondaryColor([col.r, col.g, col.b, 255]);
        }
    });
}

function setup_events(editor: Editor) {
    let editorContainer = document.getElementById("editorContainer")!;

    document.getElementById("fileNew")!.onclick = () => {
        editor.getCurrentCanvas().clearAll();
        editor.getCurrentCanvas().steps.clear();
    };

    document.getElementById("fileLoad")!.onclick = () => {
        loadFile()
            .then((message) => {
                // editor.getCurrentCanvas().removeLayers();
                // editor = new Editor({ width: message.width, height: message.height });
                let data = Uint8ClampedArray.from(message.data);
                // editor.getCurrentCanvas().getCurrentLayer().setImageData(data);
                // console.log(editor.getCurrentCanvas().getCurrentLayer().getImage());
                let imageData = new ImageData(32, 32);
                imageData.data.set(data);
                let image = new Image(imageData);
                editor.getCurrentCanvas().getCurrentLayer().setImage(image);
            })
            .catch((error) => console.error(error));
    }

    document.getElementById("fileSaveAs")!.onclick = () => {
        let size = editor.getCurrentCanvas().getSize();
        let data = Array.from(editor.getCurrentCanvas().getCurrentLayer().getImageData());

        let message: ImageMessage = {
            width: size.width,
            height: size.height,
            name: "image",
            path: "",
            data: data,
        };
        saveFile(message);
    }

    document.getElementById("fileImport")!.onclick = () => {
    }

    document.getElementById("penTool")!.onclick = () => {
        editor.paintTool = editor.penTool;
    };

    document.getElementById("rulerTool")!.onclick = () => {
        editor.paintTool = editor.rulerTool;
    };

    document.getElementById("compassTool")!.onclick = () => {
        editor.paintTool = editor.compassTool;
    };


    document.getElementById("squareTool")!.onclick = () => {
        editor.paintTool = editor.squareTool;
    };

    document.getElementById("undo")!.onclick = () => {
        // editor.steps.undo(editor.getCurrentCanvas());
        editor.getCurrentCanvas().steps.undoStep(editor.getCurrentCanvas());
    }

    document.getElementById("redo")!.onclick = () => {
        // editor.steps.redo(editor.getCurrentCanvas());
        editor.getCurrentCanvas().steps.redoStep(editor.getCurrentCanvas());
    }

    document.getElementById("eraseTool")!.onclick = () => {
    };

    document.getElementById("addLayer")!.onclick = () => {
        showPromptDialog("Add layer", "new", (value) => {
            let name = value.length > 0 ? value : "unnamed";
            editor.getCurrentCanvas().addLayer(name);

            let layer = editor.getCurrentCanvas().getCurrentLayer();
            let step = new LayerAddedStep(layer);
            editor.getCurrentCanvas().steps.addStep(step);
        });
    }

    document.getElementById("removeLayer")!.onclick = () => {
        let layer = editor.getCurrentCanvas().getCurrentLayer();
        let step = new LayerRemovedStep(layer, editor.getCurrentCanvas().getCurrentLayerIndex());
        editor.getCurrentCanvas().steps.addStep(step);
        editor.getCurrentCanvas().removeCurrentLayer();
    }

    document.getElementById("moveLayerUp")!.onclick = () => {
        if (editor.getCurrentCanvas().moveLayerUp()) {
            let step = new LayerMovedUpStep(editor.getCurrentCanvas().getCurrentLayerIndex());
            editor.getCurrentCanvas().steps.addStep(step);
        }
    }

    document.getElementById("moveLayerDown")!.onclick = () => {
        if (editor.getCurrentCanvas().moveLayerDown()) {
            let step = new LayerMovedDownStep(editor.getCurrentCanvas().getCurrentLayerIndex());
            editor.getCurrentCanvas().steps.addStep(step);
        }
    }

    document.getElementById("addColor")!.onclick = () => {
        editor.palette.addColorButton();
    }

    document.getElementById("removeColor")!.onclick = () => {
        editor.palette.removeColorButton();
    }

    document.getElementById("addFrame")!.onclick = () => {
        editor.addFrame(editor.getCurrentCanvas().getTemplate());
    }

    document.onmousedown = (e) => {
        editor.onMouseDown(e);
    }

    document.onmouseup = (e) => {
        editor.onMouseUp(e);
    }

    document.onmousemove = (e) => {
        editor.onMouseMove(e);
    }

    editorContainer.onwheel = (e) => {
        editor.onWheel(e);
    }

    document.onkeydown = (e) => {
        editor.onKeyDown(e);
    }

    document.onkeyup = (e) => {
        editor.onKeyUp(e);
    }

    editorContainer.onmouseenter = () => {
        editor.onMouseEnter();
    }

    editorContainer.onmouseleave = () => {
        editor.onMouseLeave();
    }
}
