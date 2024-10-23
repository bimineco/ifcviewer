export class ErrorDialog{
    showErrorDialog(message: string) {
        const errorDialog = document.getElementById('error-dialog') as HTMLDialogElement;
        const errorMsg = document.getElementById('error-msg') as HTMLElement;
        errorMsg.textContent = message;
        errorDialog.showModal();
    }
}