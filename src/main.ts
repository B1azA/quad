import "@melloware/coloris/dist/coloris.css";
import "./styles/styles.scss"
import { Editor } from "./editor/editor";
import { ImageMessage, loadFile, saveFile } from "./tauri";

import Coloris from "@melloware/coloris";
import { TinyColor } from "@ctrl/tinycolor";

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
		editor.steps.clear();
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
		editor.steps.undo(editor.canvas);
	}

	document.getElementById("redo")!.onclick = () => {
		editor.steps.redo(editor.canvas);
	}

	document.getElementById("eraseTool")!.onclick = () => {
	};

	document.getElementById("addLayer")!.onclick = () => {
		let layer = editor.canvas.createLayerTransformed();
		editor.canvas.addLayer(layer);
	}

	document.getElementById("removeLayer")!.onclick = () => {
		editor.canvas.removeLayer();
	}

	document.getElementById("moveLayerUp")!.onclick = () => {
	}

	document.getElementById("moveLayerDown")!.onclick = () => {
	}

	let mouseOverEditorContainer = false;
	editorContainer.onmouseenter = (e) => {
		mouseOverEditorContainer = true;
	}

	editorContainer.onmouseleave = (e) => {
		mouseOverEditorContainer = false;
	}

	editorContainer.onmousedown = (e) => {
		if (mouseOverEditorContainer) {
			editor.onMouseDown(e);
		}
	}

	document.onmouseup = (e) => {
		if (mouseOverEditorContainer) {
			editor.onMouseUp(e);
		}
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
}
