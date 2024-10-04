
export type ToDoStatus = "Activa" | "Cerrada" | "Pendiente" | "Entregada" | "En proceso"
export type ToDoPriority = "N/A" |"Baja" | "Media" | "Alta"

export interface IToDo {
    name: string
    user: string
    description: string
    status: ToDoStatus
    priority: ToDoPriority
    date: string

} 
export class ToDo implements IToDo{
    name: string
    user: string
    description: string
    status: ToDoStatus
    priority: ToDoPriority
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
    edit(data: IToDo) {
        this.name = data.name;
        this.user = data.user;
        this.description = data.description;
        this.priority = data.priority;
        this.status = data.status;
        this.date = data.date;
    }

    setUI(){
        
        // Mapear el status a colores específicos
        const statusColors: { [key in ToDoStatus]: string } = {
            "Activa": "#f44336", // Rojo
            "Cerrada": "#4caf50", // Verde
            "Pendiente": "#ff9800", // Naranja
            "Entregada": "#686868", // Gris
            "En proceso": "#2196f3", // Azul
        }
        // Mapear la prioridad a los colores
        const priorityColors: {[key in ToDoPriority]: string} = {
            "N/A": "#6b96cf", // Var(--complementary-light)
            "Baja": "#4caf55", // Verde
            "Media": "#ff9805", // Naranja
            "Alta": "#f44346", // Rojo
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
        
        // Obtener el color según el estado y la prioridad
        const color = statusColors[this.status]
        const colorPriority = priorityColors[this.priority]

        
        this.ui = document.createElement('div')
        this.ui.className = "to-do-item"
        this.ui.setAttribute('data-to-do-id', this.id)
        this.ui.style.backgroundColor  = priorityColors[this.priority];
        this.ui.innerHTML = `
        <div style="display: flex; justify-content:space-between; align-items:center">
            <div style="display: flex; column-gap:15px; align-items:center">
                <button class="show-more-to-do" data-to-do-id="${this.id}" style="background-color:${color}; padding:10px; border-radius:10px;"><span class="material-symbols-outlined">folder_open</span></button>    
                <p data-to-do-info='name'>${this.name}</p>
            </div>
            <p data-to-do-info='date' style="text-wrap: nowrap; margin-left:10px;">${this.date}</p>
            <div class="additional-info" style="display: none;">
                <p data-to-do-info='user'>${this.user || 'Usuario no disponible'}</p>    
                <p data-to-do-info='description'>${this.description || 'Descripción no disponible'}</p>
                <p data-to-do-info='status'>${this.status || 'Estado no disponible'}</p>
                <p data-to-do-info='priority'>${this.priority || 'Prioridad no disponible'}</p>
            </div>
        </div>`   
    }

}
