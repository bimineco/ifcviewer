import { v4 as uuidv4 } from 'uuid'

export type ProjectType = "Implantación Interna" | "Implantación Externa" | "Desarrollo de Proyecto" | "Asistencia Técnica"
export type ProjectStatus = "Oferta" | "Pendiente" | "Activa" | "Entregada" | "Finalizada"

export interface IProject {
    name: string
    code: string
    description: string
    type: ProjectType
    status: ProjectStatus
    date: Date
} 
export class Project implements IProject{
    // To satisfy the IProject
    name: string
    code: string
    description: string
    type: "Implantación Interna" | "Implantación Externa" | "Desarrollo de Proyecto" | "Asistencia Técnica"
    status: "Oferta" | "Pendiente" | "Activa" | "Entregada" | "Finalizada"
    date: Date

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
        if (this.ui) {return}
        this.ui = document.createElement('div')
        this.ui.className = "project-card"
        this.ui.innerHTML = `
        <div class="card-header">
            <p style="background-color: #39ad03; padding: 12px; border-radius: 8px; aspect-ratio: 1;">IN</p>
                <div>
                    <h5>${this.name}</h5>
                    <p>${this.description}</p>
                </div>
        </div>
        <div class="card-content">
            <div class="card-property">
                <p style="color: #212E3F">Código de Proyecto</p>
                <p>${this.code}</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Estado</p>
                <p>${this.status}</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Tipo</p>
                <p>${this.type}</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Presupuesto</p>
                <p>${this.budget}€</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Progreso Estimado</p>
                <p>${this.progress}%</p>
            </div>
        </div>`
    }
}