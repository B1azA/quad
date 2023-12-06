import { Editor } from "./editor/editor";
import { ImageMessage, loadFile, saveFile } from "./tauri";
import "./styles/styles.scss"

let editor = new Editor({ width: 32, height: 32 });
run();

function run() {
	setup_events(editor);
}

function setup_events(editor: Editor) {
	let editorContainer = document.getElementById("editorContainer")!;

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


	document.getElementById("squareTool")!.onclick = () => {
		console.log(editor.squareTool);
		editor.paintTool = editor.squareTool;
		console.log("jojo");
	};

	editorContainer.onmousedown = (e) => {
		editor.onMouseDown(e);
	}

	editorContainer.onmouseup = (e) => {
		editor.onMouseUp(e);
	}

	editorContainer.onmousemove = (e) => {
		editor.onMouseMove(e);
	}

	editorContainer.onwheel = (e) => {
		editor.onWheel(e);
	}

	editorContainer.onkeydown = (e) => {
		editor.onKeyDown(e);
	}

	editorContainer.onkeyup = (e) => {
		editor.onKeyUp(e);
	}
}
