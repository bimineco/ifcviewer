export type ToDoStatus = "Activa" | "Cerrada" | "Pendiente" | "Entregada" | "En proceso"

export interface IToDo {
    name: string
    user: string
    description: string
    status: ToDoStatus
    date: string
} 
export class ToDo implements IToDo{
    name: string
    user: string
    description: string
    status: ToDoStatus
    date: string

    //Internals
    id: string
    ui: HTMLDivElement
    
    constructor(data: IToDo){
        for (const key in data){
            if(key === "ui"){
                continue
            }
            this[key] = data[key]
        }
        
        this.setUI()
    }
    setUI(){

        // Incluir un valor predefinido a la fecha:
        let inputDate = (document.querySelector('input[name="date"]') as HTMLInputElement).value;

        if (!inputDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const startDate = `${day}/${month}/${year}`;  
            this.date = startDate; 
        } else {
            let startDate: Date;

            if (typeof this.date === 'string') {
                const [day, month, year] = this.date.split('/').map(Number);
                startDate = new Date(year, month - 1, day);
            } else {
                startDate = this.date;
            }
        // Format the date to DD/MM/YYYY
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        const formattedDate = `${day}/${month}/${year}`;

        this.date = formattedDate;
        }

        //Crear el todo-item
        if (this.ui) {return}

        this.ui = document.createElement('div')
        this.ui.className = "to-do-item"
        this.ui.setAttribute('to-do-item-id', this.id)
        this.ui.innerHTML = `
        <div style="display: flex; justify-content:space-between; align-items:center">
        <div style="display: flex; column-gap:15px; align-items:center">
            <span class="material-symbols-outlined" style="background-color:#686868; padding:10px; border-radius:10px;">home_repair_service</span>
            <p>${this.name}</p>
        </div>
        <p style="text-wrap: nowrap; margin-left:10px;">${this.date}</p>
        </div>`
    }
}
