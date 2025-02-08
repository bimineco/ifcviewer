export class Modals{
    
    get = (modalId: string): HTMLDialogElement | null => {
        return document.getElementById(modalId) as HTMLDialogElement | null;
    }


    show = (modalId: string) => {
        const modal = this.get(modalId);
        if (modal) {
            modal.showModal();
        } else {
            console.warn(`Modal with ID ${modalId} not found`);
        }
    }

    close = (modalId: string) => {
        const modal = this.get(modalId);
        if (modal) {
            modal.close();
        } else {
            console.warn(`Modal with ID ${modalId} not found`);
        }
    };
}