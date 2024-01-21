import "@melloware/coloris/dist/coloris.css";
import "./styles/styles.scss";
import { Editor } from "./editor/editor";
import {
    ExportMessage,
    fileImport,
    fileExport,
    ProjectMessage,
    FrameMessage,
    LayerMessage,
    projectSave,
    projectLoad,
} from "./tauri";

import Coloris from "@melloware/coloris";
import { TinyColor } from "@ctrl/tinycolor";
import { showPromptDialog, showConfirmDialog } from "./editor/dialog";
import { LayerAddedStep, LayerMovedDownStep, LayerMovedUpStep, LayerRemovedStep } from "./editor/steps/layerStep";
import { Image } from "./editor/canvas/image";



let frame1: FrameMessage = {
    layers: [],
};

let frame2: FrameMessage = {
    layers: [],
};

let projectMessage: ProjectMessage = {
    name: "Project",
    width: 32,
    height: 32,
    frames: [frame1, frame2, frame1],
};

let editor = new Editor(projectMessage);
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
        projectLoad()
            .then((message) => {
                console.log(message.name);
            })
            .catch((error) => console.error(error));
    }

    document.getElementById("fileSaveAs")!.onclick = () => {
        let data = Array.from(editor.getCurrentCanvas().getCurrentLayer().getImageData());

        let layer: LayerMessage = {
            name: "VRSTVA",
            data: data,
        }

        let frame: FrameMessage = {
            layers: [layer],
        }

        let projectMessage: ProjectMessage = {
            name: "JMENO",
            width: 32,
            height: 32,
            frames: [frame],
        };

        projectSave(projectMessage);
    }

    document.getElementById("fileImport")!.onclick = () => {
        fileImport()
            .then((message) => {
                showConfirmDialog("Are you sure? It will erase the current layer.", (confirmed) => {
                    if (confirmed) {
                        // editor.getCurrentCanvas().removeLayers();
                        // editor = new Editor({ width: message.width, height: message.height });
                        let data = Uint8ClampedArray.from(message.data);
                        // editor.getCurrentCanvas().getCurrentLayer().setImageData(data);
                        // console.log(editor.getCurrentCanvas().getCurrentLayer().getImage());
                        let imageData = new ImageData(32, 32);
                        imageData.data.set(data);
                        let image = new Image(imageData);
                        editor.getCurrentCanvas().getCurrentLayer().setImage(image);
                    }
                });
            })
            .catch((error) => console.error(error));
    }

    document.getElementById("fileExport")!.onclick = () => {
        let size = editor.getCurrentCanvas().getSize();
        let data = Array.from(editor.getCurrentCanvas().getCurrentLayer().getImageData());

        let exportMessage: ExportMessage = {
            width: size.width,
            height: size.height,
            name: "image",
            data: data,
        };
        fileExport(exportMessage);
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
        editor.undoStepOnCanvas();
    }

    document.getElementById("redo")!.onclick = () => {
        editor.redoStepOnCanvas();
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
        editor.palette.addColor();
    }

    document.getElementById("removeColor")!.onclick = () => {
        editor.palette.removeColor();
    }

    document.getElementById("duplicateColor")!.onclick = () => {
        editor.palette.duplicateColor();
    }

    document.getElementById("moveColorLeft")!.onclick = () => {
        editor.palette.moveColorLeft();
    }

    document.getElementById("moveColorRight")!.onclick = () => {
        editor.palette.moveColorRight();
    }

    document.getElementById("addFrame")!.onclick = () => {
        editor.addFrame(editor.getCurrentCanvas().getTemplate());
    }

    document.getElementById("removeFrame")!.onclick = () => {
        editor.removeFrame();
    }

    document.getElementById("duplicateFrame")!.onclick = () => {
        editor.duplicateFrame();
    }

    document.getElementById("moveFrameUp")!.onclick = () => {
        editor.moveFrameUp();
    }

    document.getElementById("moveFrameDown")!.onclick = () => {
        editor.moveFrameDown();
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
