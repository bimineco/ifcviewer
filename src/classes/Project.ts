import { v4 as uuidv4 } from 'uuid'
import { DateFunctions } from './DateFunctions'

export type ProjectType = "Implantación Interna" | "Implantación Externa" | "Desarrollo de Proyecto" | "Asistencia Técnica"
export type ProjectStatus = "Oferta" | "Pendiente" | "Activa" | "Entregada" | "Finalizada"

export interface IProject {
    name: string
    code: string
    description: string
    type: ProjectType
    status: ProjectStatus
    date: string
    budget: number
    progress?: number

} 
export class Project implements IProject{
    // To satisfy the IProject
    name: string
    code: string
    description: string
    type: ProjectType
    status: ProjectStatus
    date: string
    budget: number = 0
    progress?: number = 0
    
    // Class internals
    id: string
    
    constructor(data: IProject, id = uuidv4()){
        // Project data definition
        for (const key in data){
            this[key] = data[key]
        }
        this.id = id
        
        // Incluir un valor predefinido a la fecha:
        let inputDate = data.date || "";
                
        if (!inputDate) {
            const dateFunctions = new DateFunctions()
            this.date = dateFunctions.todayDate()
        } else {
            // Si se proporciona fecha, convertirla de YYYY-MM-DD a DD/MM/YYYY
            const [selectedYear, selectedMonth, selectedDay] = inputDate.split('-').map(Number);

            if (!isNaN(selectedYear) && !isNaN(selectedMonth) && !isNaN(selectedDay)) {
                const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
                const formattedDate = `${String(selectedDate.getDate()).padStart(2, "0")}/${String(
                    selectedDate.getMonth() + 1
                ).padStart(2, "0")}/${selectedDate.getFullYear()}`;

                this.date = formattedDate;
            } else {
                throw new Error("Invalid date format. Please use YYYY-MM-DD.");
            }

        }
    }
}