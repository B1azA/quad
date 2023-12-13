// creates a dialog with a prompt and returns its value in a callback
export function showPromptDialog(title: string, defaultValue: string, callback: (value: string) => void) {
    let dialog = <HTMLDialogElement>document.getElementById("promptDialog");
    dialog.returnValue = "";
    dialog.showModal();

    let titleEl = <HTMLParagraphElement>dialog.querySelector("p");
    titleEl.textContent = title;

    let input = <HTMLInputElement>dialog.querySelector("input");
    let ret = defaultValue;
    input.value = ret;

    dialog.onclose = () => {
        if (dialog.returnValue == "confirm") {
            ret = input.value;
            callback(ret);
        }
    }
}
