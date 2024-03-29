/** Create a prompt dialog with a prompt and return its value in a callback. */
export function showPromptDialog(
    title: string,
    defaultValue: string,
    callback: (value: string) => void,
) {
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
    };
}

/** Create a confirmation dialog with a confirmation and return its value in a callback. */
export function showConfirmDialog(
    title: string,
    confirmButtonText: string,
    cancelButtonText: string,
    callback: (confirmed: boolean) => void,
) {
    let dialog = <HTMLDialogElement>document.getElementById("confirmDialog");
    let confirmButton = <HTMLButtonElement>(
        document.getElementById("confirmButton")
    );
    let cancelButton = <HTMLButtonElement>(
        document.getElementById("cancelButton")
    );

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
    };
}

/** Create a dialog with a message and call the callback when clicks on "ok". */
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
    };
}

/** Create a size dialog with a confirmation and return its value in a callback. */
export function showSizeDialog(
    title: string,
    defaultValue: { width: number; height: number },
    callback: (
        confirmed: boolean,
        size: { width: number; height: number },
    ) => void,
) {
    let dialog = <HTMLDialogElement>document.getElementById("sizeDialog");
    dialog.returnValue = "";
    dialog.showModal();

    let titleEl = <HTMLParagraphElement>dialog.querySelector("p");
    titleEl.textContent = title;

    let ret = defaultValue;
    let inputWidth = <HTMLInputElement>(
        document.getElementById("sizeDialogWidthInput")
    );
    inputWidth.min = "1";
    inputWidth.max = "512";
    inputWidth.value = defaultValue.width.toString();
    let inputHeight = <HTMLInputElement>(
        document.getElementById("sizeDialogHeightInput")
    );
    inputHeight.min = "1";
    inputHeight.max = "512";
    inputHeight.value = defaultValue.height.toString();

    dialog.onclose = () => {
        let confirmed = dialog.returnValue == "ok";
        let width = parseInt(inputWidth.value);
        let height = parseInt(inputHeight.value);

        ret = { width, height };
        callback(confirmed, ret);
    };
}
