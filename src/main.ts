import "@melloware/coloris/dist/coloris.css";
import "./styles/styles.scss";
import { Editor } from "./editor/editor";
import {
    ImageMessage,
    ImagesMessage,
    ProjectMessage,
    ImageSize,
    fileImportImage,
    fileExportImage,
    fileExportImages,
    projectSaveAs,
    projectSave,
    projectLoad,
} from "./tauri";

import Coloris from "@melloware/coloris";
import { TinyColor } from "@ctrl/tinycolor";
import { showPromptDialog, showConfirmDialog, showMessageDialog, showSizeDialog } from "./editor/dialog";
import { LayerAddedStep, LayerMovedDownStep, LayerMovedUpStep, LayerRemovedStep } from "./editor/steps/layerStep";
import { Image } from "./editor/canvas/image";

setupProject();

// show prompt for project creation and loading and then start editor
function setupProject() {
    let projectMessage: ProjectMessage = {
        name: "Project",
        width: 32,
        height: 32,
        frames: [],
        colors: [],
        path: "",
    };
    showConfirmDialog("Do you want to create a new project or open an old one?", "New Project", "Open Project", (createNew) => {
        if (createNew) {
            showSizeDialog("Choose a canvas size", { width: 32, height: 32 }, (confirmed, size) => {
                if (confirmed) {
                    console.log("New project created!")
                    projectMessage.width = size.width;
                    projectMessage.height = size.height;
                    let editor = new Editor(projectMessage);
                    run(editor);
                } else {
                    showMessageDialog("Failed to create a new project!", () => {
                        setupProject();
                    })
                }
            });
        } else {
            projectLoad()
                .then((message) => {
                    let editor = new Editor(message);
                    console.log("Project " + message.name + " loaded");
                    run(editor);
                })
                .catch((error) => {
                    console.log(error);
                    showMessageDialog("Failed to open the project!", () => {
                        setupProject();
                    })
                });
        }
    });
}

function run(editor: Editor) {
    setupEvents(editor);

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

function setupEvents(editor: Editor) {
    let editorContainer = document.getElementById("editorContainer")!;

    document.getElementById("fileNew")!.onclick = () => {
        showConfirmDialog("This will erase the current project, do you want to save it?", "Yes", "No", (confirmed) => {
            if (confirmed) {
                saveProject(editor, (succesful) => {
                    if (succesful) {
                        showMessageDialog("Succesfully saved the project!", () => {
                            let projectMessage: ProjectMessage = {
                                name: "Project",
                                width: 32,
                                height: 32,
                                frames: [],
                                colors: [],
                                path: "",
                            };

                            let oldEditor = editor;
                            showSizeDialog("Choose a canvas size", { width: 32, height: 32 }, (confirmed, size) => {
                                if (confirmed) {
                                    console.log("New project created!")
                                    projectMessage.width = size.width;
                                    projectMessage.height = size.height;
                                    let editor = new Editor(projectMessage);
                                    oldEditor.remove();
                                    run(editor);
                                } else {
                                    showMessageDialog("Failed to create a new project!", () => {
                                    });
                                }
                            });
                        });
                    } else {
                        showMessageDialog("Failed to save the project!", () => { });
                    }
                });

            } else {
                let projectMessage: ProjectMessage = {
                    name: "Project",
                    width: 32,
                    height: 32,
                    frames: [],
                    colors: [],
                    path: "",
                };

                let oldEditor = editor;
                showSizeDialog("Choose a canvas size", { width: 32, height: 32 }, (confirmed, size) => {
                    if (confirmed) {
                        console.log("New project created!")
                        projectMessage.width = size.width;
                        projectMessage.height = size.height;
                        let editor = new Editor(projectMessage);
                        oldEditor.remove();
                        run(editor);
                    } else {
                        showMessageDialog("Failed to create a new project!", () => {
                        });
                    }
                });
            }
        });
    };

    document.getElementById("fileLoad")!.onclick = () => {
        showConfirmDialog("This will erase the current project, do you want to save it?", "Yes", "No", (confirmed) => {
            if (confirmed) {
                saveProject(editor, (succesful) => {
                    if (succesful) {
                        showMessageDialog("Succesfully saved the project!", () => {
                            let oldEditor = editor;
                            projectLoad()
                                .then((message) => {
                                    let editor = new Editor(message);
                                    oldEditor.remove();
                                    run(editor);
                                    console.log("Project " + message.name + " loaded");
                                })
                                .catch((error) => {
                                    showMessageDialog("Failed to open the project!", () => { });
                                    console.error(error);
                                });
                        });
                    } else {
                        showMessageDialog("Failed to save the project!", () => { });
                    }
                });
            } else {
                let oldEditor = editor;
                projectLoad()
                    .then((message) => {
                        let editor = new Editor(message);
                        oldEditor.remove();
                        run(editor);
                        console.log("Project " + message.name + " loaded");
                    })
                    .catch((error) => {
                        showMessageDialog("Failed to open the project!", () => { });
                        console.error(error);
                    });
            }
        });
    }

    document.getElementById("fileSaveAs")!.onclick = () => {
        projectSaveAs(editor.generateProjectMessage())
            .then((path) => {
                showMessageDialog("Succesfully saved the project!", () => { });
                editor.setPath(path);
            })
            .catch((error) => {
                console.log(error);
                showMessageDialog("Failed to save the project!", () => { });
            });
    }

    document.getElementById("fileSave")!.onclick = () => {
        saveProject(editor, (succesful) => {
            if (succesful) {
                showMessageDialog("Succesfully saved the project!", () => { });
            } else {
                showMessageDialog("Failed to save the project!", () => { });
            }
        });
    }

    document.getElementById("fileImportLayer")!.onclick = () => {
        let size = editor.getCurrentCanvas().getSize();
        let imageSize = {
            width: size.width,
            height: size.height,
        };
        fileImportImage(imageSize)
            .then((message) => {
                let data = Uint8ClampedArray.from(message.data);
                let imageData = new ImageData(size.width, size.height);
                imageData.data.set(data);
                let image = new Image(imageData);
                editor.getCurrentCanvas().addLayer("imported");
                editor.getCurrentCanvas().getCurrentLayer().setImage(image);
                editor.updateFrameAndAnimationFrame();
            })
            .catch((error) => {
                console.log(error);
                showMessageDialog("Failed to import the image.", () => { })
            });
    }

    document.getElementById("fileImportFrame")!.onclick = () => {
        let size = editor.getCurrentCanvas().getSize();
        let imageSize = {
            width: size.width,
            height: size.height,
        };
        fileImportImage(imageSize)
            .then((message) => {
                console.log(message.data.length, message.width, message.height);
                let data = Uint8ClampedArray.from(message.data);
                let imageData = new ImageData(size.width, size.height);
                imageData.data.set(data);
                let image = new Image(imageData);
                editor.addFrame(editor.getCurrentCanvas().getTemplate(), []);
                editor.getCurrentCanvas().getCurrentLayer().setImage(image);
                editor.updateFrameAndAnimationFrame();
            })
            .catch((error) => {
                console.log(error);
                showMessageDialog("Failed to import the image.", () => { })
            });
    }


    document.getElementById("fileExportLayer")!.onclick = () => {
        let size = editor.getCurrentCanvas().getSize();
        let data = Array.from(editor.getCurrentCanvas().getCurrentLayer().getImageData());

        let imageMessage: ImageMessage = {
            width: size.width,
            height: size.height,
            name: editor.getName(),
            data: data,
        };
        fileExportImage(imageMessage)
            .then(() => {
                showMessageDialog("Succesfully exported the layer!", () => { });
            })
            .catch((error) => {
                console.log(error);
                showMessageDialog("Failed to export the layer!", () => { });
            });
    }

    document.getElementById("fileExportFrame")!.onclick = () => {
        let size = editor.getCurrentCanvas().getSize();
        let data = Array.from(editor.getCurrentCanvas().getLayersImageCombined().imageData.data);

        let imageMessage: ImageMessage = {
            width: size.width,
            height: size.height,
            name: editor.getName(),
            data: data,
        };
        fileExportImage(imageMessage)
            .then(() => {
                showMessageDialog("Succesfully exported the frame!", () => { });
            })
            .catch((error) => {
                console.log(error);
                showMessageDialog("Failed to export the frame!", () => { });
            });
    }

    document.getElementById("fileExportFrames")!.onclick = () => {
        let size = editor.getCurrentCanvas().getSize();
        let data = [];

        for (let i = 0; i < editor.getCanvasesLength(); i++) {
            let canvas = editor.getCanvas(i);
            if (canvas != null) {
                data.push(Array.from(canvas.getLayersImageCombined().imageData.data));
            }
        }

        let imagesMessage: ImagesMessage = {
            width: size.width,
            height: size.height,
            name: editor.getName(),
            data: data,
        };

        fileExportImages(imagesMessage)
            .then(() => {
                showMessageDialog("Succesfully exported frames!", () => { });
            })
            .catch((error) => {
                console.log(error);
                showMessageDialog("Failed to export frames!", () => { });
            });
    }

    document.getElementById("penTool")!.onclick = () => {
        editor.tools.choosePenTool();
    };

    document.getElementById("rulerTool")!.onclick = () => {
        editor.tools.chooseRulerTool();
    };

    document.getElementById("compassTool")!.onclick = () => {
        editor.tools.chooseCompassTool();
    };


    document.getElementById("squareTool")!.onclick = () => {
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
        editor.addFrame(editor.getCurrentCanvas().getTemplate(), []);
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

function saveProject(editor: Editor, callback: (succesful: boolean) => void) {
    let projectMessage = editor.generateProjectMessage();
    if (projectMessage.path.length > 0) {
        projectSave(projectMessage)
            .then(() => {
                callback(true);
            })
            .catch((error) => {
                console.log(error);
                callback(false);
            });
    } else {
        projectSaveAs(projectMessage)
            .then((path) => {
                editor.setPath(path);
                callback(true);
            })
            .catch((error) => {
                console.log(error);
                callback(false);
            });
    }
}
