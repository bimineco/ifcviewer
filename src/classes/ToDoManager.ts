import {IToDo, ToDo, statusColors, priorityColors} from "./ToDo"
import { DateFunctions } from "./DateFunctions"

export class ToDoManager {
    list: ToDo[] = []
    defaultToDoId: string | null = null;
    editToDoModal: HTMLDialogElement | null;
    private correlativo: number = 0;
    
    // React
    onToDoCreated = (ToDo: ToDo) => {}
    onToDoDeleted = (ToDo: ToDo) => {}

    
    constructor(){

        if(this.list.length == 0){
            this.createDefaultToDo();
        }
    }

    newToDo(data){

    const todoId = this.generateToDoID();
    const todoData: IToDo = {
        ...data, 
        id: todoId
    };
    const toDo = new ToDo(todoData)

    this.list.push(toDo)
    this.onToDoCreated(toDo)

    //Borrar el to-do por defecto:
    if (this.defaultToDoId) {
        this.deleteToDo(this.defaultToDoId);
        this.defaultToDoId = null;
    }

    return toDo
    }

    createDefaultToDo(){

        //Fecha del día actual:
        const dateFunctions = new DateFunctions()
        const startDate = dateFunctions.todayDate()

        const defaultData : IToDo = {
            name: "Por Defecto",
            user: "JGV",
            description: "N/A",
            status: "Activa",
            priority: "N/A",
            date: startDate
        }

        const defaultToDo = this.newToDo(defaultData);
        this.defaultToDoId = defaultToDo.id
    }

    getToDo(id:string) {
        const toDo = this.list.find( (toDo) => {
            return toDo.id == id
        })
        return toDo
    }

    // Borrar
    deleteToDo(id: string) {
        const toDo = this.getToDo(id)
        if (!toDo){return}
        const remaining = this.list.filter( (toDo) => {
            return toDo.id !== id
        })
        this.list = remaining
        this.onToDoDeleted(toDo)
    }
    
    // Crear un id para ToDo:

    getLastCorrelative(correlativo: number): number {
        let maxCorrelativo = correlativo
        const toDoItems = document.querySelectorAll('.to-do-item');

        if (toDoItems.length === 0) { return 0; }

        toDoItems.forEach((item: Element) => {
            const id = item.getAttribute('data-to-do-id');
            if (id) {
                const numeroCalculado = parseInt(id.split('-')[1], 10);
                if (!isNaN(numeroCalculado) && numeroCalculado > maxCorrelativo) {
                    maxCorrelativo = numeroCalculado;
                }
            }
        });

        return maxCorrelativo;
    }
    generateToDoID(): string{

        // Obtner el código de proyecto:    
        const projectCodeElement = document.getElementById('project-code');
        if(!projectCodeElement){ 
            console.error("No se pudo obtener el código del proyecto.");
            return '';
        }
        
        const projectCode = projectCodeElement.textContent?.trim();
        if (!projectCode) {
            console.error("El código del proyecto está vacío.");
            return '';
        }
        
        this.correlativo = this.getLastCorrelative(this.correlativo);
        const correlativoStr = this.correlativo.toString().padStart(3, '0');

        // Estructura
        const todoId = `${projectCode}-${correlativoStr}`;
        
        this.correlativo++; 
        return todoId
        
    }

    // Actualizar los colores:
    updateColors(toDo: ToDo) {

        const toDoStatus = toDo.status;
        let toDoPriority;
        if(toDoStatus === "Cerrada") {
            toDoPriority = "N/A"; 
        }else{
            toDoPriority = toDo.priority;
        }
        
        const statusColor = statusColors[toDoStatus];
        const priorityColor = priorityColors[toDoPriority];

        const toDoElement = (document.querySelector(`[data-to-do-id="${toDo.id}"]`) as HTMLDivElement);
        if (toDoElement) {
            toDoElement.style.backgroundColor = priorityColor;
            const buttonElement = (toDoElement.querySelector('button.show-more-to-do') as HTMLButtonElement);
            if (buttonElement) {
                buttonElement.style.backgroundColor = statusColor;
            }
        }
    }
    saveToDoChanges(toDoId: string, data: IToDo) {
    
        // Obtener el To-Do existente
        const toDo = this.getToDo(toDoId);
        if (toDo) {
            toDo.name = data.name
            toDo.user = data.user   
            toDo.status = data.status 
            toDo.priority = data.priority 
            toDo.date = data.date 
            toDo.description = data.description 
            
            // Actualizar los colores.
            this.updateColors(toDo);

        } else {
            console.error(`No se encontró el To-Do con ID: ${toDoId}`);
            return; 
        }
    }
    // Función para Filtrar dentro del To-Do Container:
    filterToDos(filter: string) {
        const toDosContainer = document.getElementById('to-do-container') as HTMLDivElement;
        const toDos = (toDosContainer?.querySelectorAll('.to-do-item') as NodeListOf<HTMLDivElement>);
        if (toDos) {
            toDos.forEach((toDo) => {
                const toDoName = toDo.querySelector('[data-to-do-info="name"]')?.textContent;
                if (toDoName) {
                    const lowerToDoName = toDoName.toLowerCase();
                    const lowerFilter = filter.toLowerCase();
                    console.log(lowerFilter)
                    if (lowerToDoName.startsWith(lowerFilter)) {
                        toDo.style.display = 'block';
                    } else if (lowerToDoName.includes(lowerFilter)) {
                        toDo.style.display = 'block';
                    } else {
                        toDo.style.display = 'none';
                    }
                } else {
                    toDo.style.display = 'none';
                }
            });
        }
    }
    filterAdvanced() {
        console.log('Pendiente de Desarrollo');
    }   
}

