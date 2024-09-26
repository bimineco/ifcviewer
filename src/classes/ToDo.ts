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
        // Mapear el status a colores específicos
        const statusColors: { [key in ToDoStatus]: string } = {
            "Activa": "#f44336", // Rojo
            "Cerrada": "#4caf50", // Verde
            "Pendiente": "#ff9800", // Naranja
            "Entregada": "#2196f3", // Azul
            "En proceso": "#686868" // Gris
        }

        // Incluir un valor predefinido a la fecha:
        let inputDate = (document.querySelector('input[name="date-to-do"]') as HTMLInputElement).value;

        if (!inputDate) {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
            const currentDay = String(today.getDate()).padStart(2, '0');
            const startDate = `${currentDay}/${currentMonth}/${currentYear}`;  
            this.date = startDate; 
        } else {
            let selectedDate: Date;

            const [selectedYear, selectedMonth, selectedDay] = inputDate.split('-').map(Number);
            selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);

            // Format the date to DD/MM/YYYY
            const formattedYear = selectedDate.getFullYear();
            const formattedMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const formattedDay = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${formattedDay}/${formattedMonth}/${formattedYear}`;

            this.date = formattedDate;
        }

        //Crear el to-do-item
        if (this.ui) {return}
        
        // Obtener el color según el estado
        const color = statusColors[this.status]

        this.ui = document.createElement('div')
        this.ui.className = "to-do-item"
        this.ui.setAttribute('to-do-item-id', this.id)
        this.ui.innerHTML = `
        <div style="display: flex; justify-content:space-between; align-items:center">
            <div style="display: flex; column-gap:15px; align-items:center">
                <span class="material-symbols-outlined" style="background-color:${color}; padding:10px; border-radius:10px;">home_repair_service</span>
                <p>${this.name}</p>
            </div>
            <p style="text-wrap: nowrap; margin-left:10px;">${this.date}</p>
        </div>`
    }
}
