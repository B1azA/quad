import { Editor, PaintingTool } from "./editor";
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
		editor.clearAll();
	};

	document.getElementById("fileLoad")!.onclick = () => {
		loadFile()
			.then((message) => console.log(message.name))
			.catch((error) => console.error(error));
	}

	document.getElementById("fileSaveAs")!.onclick = () => {
		// saveFile({ width: editor.canvases[0].width, height: editor.canvases[0].height, name: "image", data: editor.getImageData() });
	}

	document.getElementById("toolPen")!.onclick = () => {
		editor.paintingTool = PaintingTool.Pen;
	};

	document.getElementById("toolRuler")!.onclick = () => {
		editor.paintingTool = PaintingTool.Ruler;
	};

	document.onmousedown = (e) => {
		switch (e.button) {
			case 0:
				editor.mouseButtons[0] = true;
				editor.currentColor = editor.color0;
				break;
			case 1:
				editor.mouseButtons[1] = true;
				break
			case 2:
				editor.mouseButtons[2] = true;
				editor.currentColor = editor.color1;
				break;
		}

		if (!editor.mouseButtons[0] && !editor.mouseButtons[2]) return

		let mouseCoords = editor.getMouseCoords(e);

		switch (editor.paintingTool) {
			case PaintingTool.Pen:
				let point = { x: mouseCoords.x, y: mouseCoords.y };
				editor.drawPixel(point, layer);
				break;
			case PaintingTool.Ruler:
				editor.rulerStartCoords = mouseCoords;
				editor.rulerEndCoords = mouseCoords;
				break;
		}

		editor.lastMouseCoords = mouseCoords;
	}

	document.onmouseup = (e) => {
		let mouseCoords = editor.getMouseCoords(e);
		switch (e.button) {
			case 0:
				editor.mouseButtons[0] = false;
				break;
			case 1:
				editor.mouseButtons[1] = false;
				break
			case 2:
				editor.mouseButtons[2] = false;
				break;
		}

		if (e.button == 0 || e.button == 2) {
			switch (editor.paintingTool) {
				case PaintingTool.Pen:
					break;
				case PaintingTool.Ruler:
					var a = editor.rulerStartCoords;
					let b = editor.rulerEndCoords;
					editor.drawLine(a, b, layer);
					break;
			}
		}
	}

	let lastGlobalMousePos = { x: 0, y: 0 };
	document.onmousemove = (e) => {
		let mouseCoords = editor.getMouseCoords(e);
		// mouse position realative to vieport, not the editor
		let globalMousePos = { x: e.clientX, y: e.clientY };

		// clear template layer
		editor.clear(0);

		if (editor.mouseButtons[0] || editor.mouseButtons[2]) {
			let x = mouseCoords.x;
			let y = mouseCoords.y;

			switch (editor.paintingTool) {
				case PaintingTool.Pen: {
					// draw a line so there are no gaps when moving mouse fast
					let a = { x: mouseCoords.x, y: mouseCoords.y };
					let b = { x: editor.lastMouseCoords.x, y: editor.lastMouseCoords.y };
					editor.drawLine(a, b, layer);
					break;
				}
				case PaintingTool.Ruler: {
					var a = editor.rulerStartCoords;
					editor.rulerEndCoords = mouseCoords;
					let b = editor.rulerEndCoords;
					editor.drawLine(a, b, editor.templateLayer);
					break;
				}
			}


		} else if (editor.mouseButtons[1]) {
			let moveDelta = { x: lastGlobalMousePos.x - globalMousePos.x, y: lastGlobalMousePos.y - globalMousePos.y };
			editor.move(moveDelta);
		}

		// show current pixel
		editor.drawPixel(mouseCoords, editor.templateLayer);

		// save mouse
		editor.lastMouseCoords = mouseCoords;
		lastGlobalMousePos = globalMousePos;
	}

	window.onwheel = (e) => {
		let zoom = Math.sign(-e.deltaY) * 0.1;
		editor.zoomIn(zoom);
	}
}