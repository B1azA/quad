import { Editor } from "./editor/editor";
import { ImageMessage, loadFile, saveFile } from "./tauri";
import "./styles/styles.scss"

let editor = new Editor();
run();

let layer = 1;

function run() {
	setup_events(editor);
}

function setup_events(editor: Editor) {
	document.getElementById("fileNew")!.onclick = () => {
		editor.canvas.clearAll();
	};

	document.getElementById("fileLoad")!.onclick = () => {
		loadFile()
			.then((message) => console.log(message.name))
			.catch((error) => console.error(error));
	}

	document.getElementById("fileSaveAs")!.onclick = () => {
		// saveFile({ width: editor.canvases[0].width, height: editor.canvases[0].height, name: "image", data: editor.getImageData() });
	}

	document.getElementById("fileImport")!.onclick = () => {
		// saveFile({ width: editor.canvases[0].width, height: editor.canvases[0].height, name: "image", data: editor.getImageData() });
		editor.steps.undo(editor.canvas);
	}

	document.getElementById("toolPen")!.onclick = () => {
		editor.paintTool = editor.penTool;
	};

	document.getElementById("toolRuler")!.onclick = () => {
		editor.paintTool = editor.rulerTool;
	};

	document.onmousedown = (e) => {
		editor.onMouseDown(e);
	}

	document.onmouseup = (e) => {
		editor.onMouseUp(e);
	}

	document.onmousemove = (e) => {
		editor.onMouseMove(e);
	}

	window.onwheel = (e) => {
		editor.onWheel(e);
	}

	document.onkeydown = (e) => {
		editor.onKeyDown(e);
	}

	document.onkeyup = (e) => {
		editor.onKeyUp(e);
	}
}