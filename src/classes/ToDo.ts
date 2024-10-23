import { DateFunctions } from "./DateFunctions"

export type ToDoStatus = "Activa" | "Cerrada" | "Pendiente" | "Entregada" | "En proceso"
export type ToDoPriority = "N/A" |"Baja" | "Media" | "Alta"

// Mapear el status a colores específicos
export const statusColors: { [key in ToDoStatus]: string } = {
    "Activa": "#ff9900", // (rojo claro alternativo)
    "Cerrada": "#8bc34a", // (verde pastel)
    "Pendiente": "#ffa07a", // (naranja claro)
    "Entregada": "#686868", // Gris
    "En proceso": "#03a9f4", // (azul pastel)
}
// Mapear la prioridad a los colores
export const priorityColors: {[key in ToDoPriority]: string} = {
    "N/A": "#6b96cf", // Var(--complementary-light)
    "Baja": "#8bc34a", // (verde pastel)
    "Media": "#ffc107", // (naranja pastel)
    "Alta": "#ff3737" // (rojo pastel)
}   


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

    
    static idCounter: number = 1;

    constructor(data: IToDo & { id?: string }){
        for (const key in data){
            this[key] = data[key]
        }
        if (data.id) {
            this.id = data.id; 
        } else {
            this.id = `to-do-${ToDo.idCounter.toString().padStart(3, '0')}`;
            ToDo.idCounter++; 
        }
        // Si no se seleciona fecha se pone la de hoy.
        if(!this.date){
            const dateFunctions = new DateFunctions()
            this.date = dateFunctions.todayDate()
        }
    }
}
