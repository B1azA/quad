import { Editor } from "./editor/editor";
import { ImageMessage, loadFile, saveFile } from "./tauri";
import "./styles/styles.scss"

let editor = new Editor({ width: 32, height: 32 });
run();

let layer = 1;

function run() {
	setup_events(editor);
}

function setup_events(editor: Editor) {
	document.getElementById("fileNew")!.onclick = () => {
		editor.canvas.clearAll();
		editor.steps.steps = [];
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
		editor.steps.undo(editor.canvas);
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