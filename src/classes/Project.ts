import { v4 as uuidv4 } from 'uuid'

export type ProjectType = "Implantación Interna" | "Implantación Externa" | "Desarrollo de Proyecto" | "Asistencia Técnica"
export type ProjectStatus = "Oferta" | "Pendiente" | "Activa" | "Entregada" | "Finalizada"

export interface IProject {
    name: string
    code: string
    description: string
    type: ProjectType
    status: ProjectStatus
    date: string
} 
export class Project implements IProject{
    // To satisfy the IProject
    name: string
    code: string
    description: string
    type: "Implantación Interna" | "Implantación Externa" | "Desarrollo de Proyecto" | "Asistencia Técnica"
    status: "Oferta" | "Pendiente" | "Activa" | "Entregada" | "Finalizada"
    date: string

    // Class internals
    ui: HTMLDivElement
    budget: number = 0
    progress: number = 0
    id: string

    constructor(data: IProject){
        // Project data definition
        for (const key in data){
            if(key === "ui"){
                continue
            }
            this[key] = data[key]
        }
        if(!this.id) {this.id = uuidv4()}
        
        this.setUI()
    }
    setUI(){
        //Comprobación del largo del nombre:
        if (this.name.length < 5) {
            throw new Error(`A project with the name: "${this.name}" has less than five (5) characters.`)
            return; 
        }
        // Incluir un valor predefinido a la fecha:
        let inputDate = (document.querySelector('input[name="date"]') as HTMLInputElement).value;

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

        //Crear el project-card
        if (this.ui) {return}

        //Incluir las dos primeras letras y el color al azar:
        const iconLetters = this.name.slice(0,2).toUpperCase()
        const colors = ['#0000FF', '#000FFF', '#00FF00', '#FFFF00', '#FFA500', '#FF0000']
        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        this.ui = document.createElement('div')
        this.ui.className = "project-card"
        this.ui.setAttribute('data-project-id', this.id)
        this.ui.innerHTML = `
        <div class="card-header">
            <p class="card-icon" style="background-color: ${randomColor}">${iconLetters}</p>
                <div>
                    <h5 data-project-info='name'>${this.name}</h5>
                    <p data-project-info='description'>${this.description}</p>
                </div>
        </div>
        <div class="card-content">
            <div class="card-property">
                <p style="color: #212E3F">Código de Proyecto</p>
                <p id="project-code" data-project-info='code'>${this.code}</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Estado</p>
                <p data-project-info='code'>${this.status}</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Tipo</p>
                <p data-project-info='type'>${this.type}</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Presupuesto</p>
                <p data-project-info='budget'>${this.budget}€</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Fecha de Finalización</p>
                <p data-project-info='date'>${this.date}</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Progreso Estimado</p>
                <p data-project-info='progress'>${this.progress}%</p>
            </div>
        </div>`
    }
}