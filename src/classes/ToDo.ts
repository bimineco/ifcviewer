export type ToDoStatus = "Activa" | "Cerrada" | "Pendiente"

export interface IToDo {
    name: string
    description: string
    status: ToDoStatus
    date: string
} 
export class ToDo implements IToDo{
    name: string
    description: string
    status: ToDoStatus
    date: string

    //Internals
    id: string
    ui: HTMLDivElement

    /*
    Pendiente de revisar la información.
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
        //Comprobación del largo del nombre:
        if (this.name.length < 5) {
            throw new Error(`A project with the name: "${this.name}" has less than five (5) characters.`)
            return; 
        }
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
                <p style="color: #212E3F;">Fecha de Finalización</p>
                <p>${this.date}</p>
            </div>
            <div class="card-property">
                <p style="color: #212E3F;">Progreso Estimado</p>
                <p>${this.progress}%</p>
            </div>
        </div>`
    }
    */
}
