// creates a dialog with a prompt and returns its value as a callback
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

// creates a dialog with a confirmation and returns its value as a callback
export function showConfirmDialog(title: string, confirmButtonText: string, cancelButtonText: string, callback: (confirmed: boolean) => void) {
    let dialog = <HTMLDialogElement>document.getElementById("confirmDialog");
    let confirmButton = <HTMLButtonElement>document.getElementById("confirmButton");
    let cancelButton = <HTMLButtonElement>document.getElementById("cancelButton");

    confirmButton.textContent = confirmButtonText;
    cancelButton.textContent = cancelButtonText;

    dialog.returnValue = "";
    dialog.showModal();

    let titleEl = <HTMLParagraphElement>dialog.querySelector("p");
    titleEl.textContent = title;

    dialog.onclose = () => {
        if (dialog.returnValue == "confirm") {
            callback(true);
        } else {
            callback(false);
        }
    }
}

export function showMessageDialog(title: string, callback: () => void) {
    let dialog = <HTMLDialogElement>document.getElementById("messageDialog");

    dialog.returnValue = "";
    dialog.showModal();

    let titleEl = <HTMLParagraphElement>dialog.querySelector("p");
    titleEl.textContent = title;

    dialog.onclose = () => {
        if (dialog.returnValue == "confirm") {
            callback();
        } else {
            callback();
        }
    }
}
