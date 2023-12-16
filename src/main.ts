import "@melloware/coloris/dist/coloris.css";
import "./styles/styles.scss"
import { Editor } from "./editor/editor";
import { ImageMessage, loadFile, saveFile } from "./tauri";

import Coloris from "@melloware/coloris";
import { TinyColor } from "@ctrl/tinycolor";
import { showPromptDialog } from "./editor/dialog";


let editor = new Editor({ width: 32, height: 32 });
run();

function run() {
    setup_events(editor);

    // setup coloris color pickers
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
            editor.setPrimaryColor([col.r, col.g, col.b, 255]);
        }
    })

    Coloris.setInstance("#picker2", {
        onChange: (color) => {
            let col = new TinyColor(color);
            editor.setSecondaryColor([col.r, col.g, col.b, 255]);
        }
    })
}

function setup_events(editor: Editor) {
    let editorContainer = document.getElementById("editorContainer")!;

    document.getElementById("fileNew")!.onclick = () => {
        editor.canvas.clearAll();
        editor.canvas.steps.clear();
    };

    document.getElementById("fileLoad")!.onclick = () => {
        loadFile()
            .then((message) => {
                editor.canvas.removeLayers();
                editor = new Editor({ width: message.width, height: message.height });
                let data = Uint8ClampedArray.from(message.data);
                editor.canvas.setImageData(data, 1);
            })
            .catch((error) => console.error(error));
    }

    document.getElementById("fileSaveAs")!.onclick = () => {
        let size = editor.canvas.getSize();
        let data = Array.from(editor.canvas.getImageData(1));

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
        // editor.steps.undo(editor.canvas);
        editor.canvas.steps.undoStep(editor.canvas);
    }

    document.getElementById("redo")!.onclick = () => {
        // editor.steps.redo(editor.canvas);
        editor.canvas.steps.redoStep(editor.canvas);
    }

    document.getElementById("eraseTool")!.onclick = () => {
    };

    document.getElementById("addLayer")!.onclick = () => {
        showPromptDialog("Add layer", "new", (value) => {
            let layer = editor.canvas.createLayerTransformed();

            let name = value.length > 0 ? value : "unnamed";
            editor.canvas.addLayer(layer, name);
        });
    }

    document.getElementById("removeLayer")!.onclick = () => {
        editor.canvas.removeLayer();
    }

    document.getElementById("moveLayerUp")!.onclick = () => {
        editor.canvas.moveLayerUp();
    }

    document.getElementById("moveLayerDown")!.onclick = () => {
        editor.canvas.moveLayerDown();
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
