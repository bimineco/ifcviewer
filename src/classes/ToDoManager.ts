import {IToDo, ToDo} from "./ToDo"
import { DateFunctions } from "./DateFunctions"

export class ToDoManager {
    list: ToDo[] = []
    ui: HTMLElement
    defaultToDoId: string | null = null;
    editToDoModal: HTMLDialogElement | null;
    correlativo: number = 0; // Correlativo inicial
    
    

    constructor(container: HTMLElement){
        
        this.ui = container   
        
        // Edición de To-Do:
        this.editToDoModal = document.getElementById('edit-to-do-details') as HTMLDialogElement | null

        if(this.list.length == 0){
            this.createDefaultToDo();
        }

    }

    newToDo(data){

    const todoId = this.generateToDoID(); // Generar el ID
    // Crear el objeto con el ID generado
    const todoData: IToDo = {
        ...data, 
        id: todoId // Agregar el ID generado
    };
    const toDo = new ToDo(todoData)

    /*
    toDo.ui.addEventListener("click", ()=>{
        const toDosContainer = document.getElementById("to-do-list")
    })
    */


    this.ui.append(toDo.ui)
    this.list.push(toDo)

    //Borrar el to-do por defecto:
    if (this.defaultToDoId) {
        this.deleteToDo(this.defaultToDoId);
        this.defaultToDoId = null;
    }

    return toDo
    }

    createDefaultToDo(){

        //Fecha del día actual:
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        let startDate = `${day}/${month}/${year}`; 

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

    deleteToDo(id: string) {
        const toDo = this.getToDo(id)
        if (!toDo){return}
        toDo.ui.remove()
        const remaining = this.list.filter( (toDo) => {
            return toDo.id !== id
        })
        this.list = remaining
    }
    // Crear un id para ToDo:
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
        const correlativoStr = this.correlativo.toString().padStart(3, '0');

        // Estructura
        const todoId = `${projectCode}-${correlativoStr}`;
        // Incrementar el correlativo para el próximo to-do
        this.correlativo++; 
        // Mostrar el ID generado en la consola
        console.log('ID del to-do generado:', todoId);
        return todoId
        
    }


    // Mostrar más información del to-do:

    showPopupToDo(){
    
    //Obtener la información del to-do:    
    const toDoName = document.querySelector('[to-do-info="name"]')?.textContent || '';
    const toDoUser = (document.querySelector('[to-do-info="user"]')?.textContent ?? '').split(":")[1].trim() || '';
    const toDoStatus = (document.querySelector('[to-do-info="status"]')?.textContent ?? '').split(":")[1].trim() || '';
    const ToDoPriority = (document.querySelector('[to-do-info="priority"]')?.textContent ?? '').split(":")[1].trim() || '';
    const toDoDate = document.querySelector('[to-do-info="date"]')?.textContent || '';
    const toDoDescription = (document.querySelector('[to-do-info="description"]')?.textContent?? '').split(":")[1].trim() || '';



    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
    <div class="popup-content">
        <dialog id="edit-to-do-details"></dialog>
        <h2>${toDoName}</h2>
        <div class="info">
            <div class="label">
                <p class="label-name">Usuario:</p>
                <p class="label-value">${toDoUser}</p>
            </div>
            <div class="label">
                <p class="label-name">Estado:</p>
                <p class="label-value">${toDoStatus}</p>
            </div>
            <div class="label">
                <p class="label-name">Prioridad:</p>
                <p class="label-value">${ToDoPriority}</p>
            </div>
            <div class="label">
                <p class="label-name">Fecha de Finalización:</p>
                <p class="label-value">${toDoDate}</p>
            </div>
        </div>
        <div class="info">
            <p class="label-name">Descripción:</p>
            <p class="label-value-description">${toDoDescription}</p>
        </div>
        <div class="buttons">
            <button id="edit-to-do-btn">Editar</button>
            <button id="close-to-do-btn">Cerrar</button>
        </div> 
    </div>
    `;

    document.body.appendChild(popup);

    const closeBtn = document.getElementById('close-to-do-btn');
    closeBtn?.addEventListener('click', () => {
        popup.remove();
    });

    const editBtn = document.getElementById('edit-to-do-btn');
    const editDialog = document.getElementById('edit-to-do-details');
    editBtn?.addEventListener('click', () => {
        console.log("Editando To-Do...");
        if (editDialog) { editDialog.showModal(); }
        const currentToDo = this.getcurrentToDo();
        console.log(currentToDo)
        if (currentToDo) {
            this.EditToDoModal(currentToDo);
        }    
        });

    }

    // Editar una to-do:
    getcurrentToDo(): ToDo | null {
        const toDoId = document.querySelector('[to-do-item-id]')?.getAttribute('to-do-item-id');
        if (!toDoId) {
            console.error("No se pudo obtener el ID del To-Do actual.");
            return null;
        }
        return this.list.find(toDo => toDo.id === toDoId) || null;
    }


    EditToDoModal(ToDo: ToDo){
        console.log("EdiTModel")
        if (!this.editToDoModal) {return}

        const toDoName = document.querySelector('[to-do-info="name"]')?.textContent || '';
        const toDoUser = document.querySelector('[to-do-info="user"]')?.textContent || '';
        const toDoStatus = document.querySelector('[to-do-info="status"]')?.textContent || '';
        const ToDoPriority = document.querySelector('[to-do-info="priority"]')?.textContent || '';
        const toDoDate = document.querySelector('[to-do-info="date"]')?.textContent || '';
        const toDoDescription = document.querySelector('[to-do-info="description"]')?.textContent || '';

        const dateFunctions = new DateFunctions();
        const formattedDate = dateFunctions.formatDateToInput(toDoDate);

        this.editToDoModal.innerHTML = `
            <form id="edit-to-do-form">
                <h2>Editar tarea</h2>
                <div class="input-list">
                    <div class="form-field-container">
                    <label><span class="material-symbols-outlined">domain</span>Nombre</label>
                    <input name="name" type="text" value="${toDoName}">
                    </div>
                    <div class="form-field-container">
                    <label><span class="material-symbols-outlined">person_add</span>Usuario</label>
                    <textarea id="user" name="user" placeholder="Usuario a asignar.">${toDoUser}</textarea>
                    </div>
                    <div class="form-field-container">
                    <label><span class="material-symbols-outlined">not_listed_location</span>Estado</label>
                    <select name="status" id="status">
                        <option value="Activa" ${toDoStatus === 'Activa' ? 'selected' : ''}>Activa</option>
                        <option value="En proceso" ${toDoStatus === 'En proceso' ? 'selected' : ''}>En proceso</option>
                        <option value="Pendiente" ${toDoStatus === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="Entregada" ${toDoStatus === 'Entregada' ? 'selected' : ''}>Entregada</option>
                        <option value="Cerrada" ${toDoStatus === 'Cerrada' ? 'selected' : ''}>Cerrada</option>
                    </select>
                    </div>
                    <div class="form-field-container">
                    <label><span class="material-symbols-outlined">priority</span>Prioridad</label>
                    <select name="priority" id="priority">
                        <option value="N/A" ${ToDoPriority === 'N/A' ? 'selected' : ''}>N/A</option>
                        <option value="Baja" ${ToDoPriority === 'Baja' ? 'selected' : ''}>Baja</option>
                        <option value="Media" ${ToDoPriority === 'Media' ? 'selected' : ''}>Media</option>
                        <option value="Alta" ${ToDoPriority === 'Alta' ? 'selected' : ''}>Alta</option>
                    </select>
                    </div>
                    <div class="form-field-container">
                    <label><span class="material-symbols-outlined">calendar_month</span>Fecha de Finalización</label>
                    <input name="date-to-do" type="date" value="${formattedDate}">
                    </div>
                    <div class="form-field-container">
                    <label><span class="material-symbols-outlined">description</span>Descripción</label>
                    <textarea id="description" name="description" placeholder="Breve descripción de la tarea en cuestion.">${toDoDescription}</textarea>
                    </div>
                    <div style="display: flex; margin: 10px 0px 10px auto; column-gap: 15px;">
                    <button id="cancel-edit-btn" type="button" style="background-color: transparent; color: var(--complementary-light)">Cancelar</button>
                    <button type="submit" style="background-color:var(--complementary-light);">Guardar cambios</button>
                    </div>
                </div>
            </form>
        `;
        

        this.editToDoModal.showModal();

        document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
            this.editToDoModal?.close();
        });

        document.getElementById('edit-to-do-form')?.addEventListener('submit', (event) => {
            event.preventDefault();
            this.saveToDoChanges();
        });
    }
    saveToDoChanges() {
        const updatedName = (document.querySelector('#edit-to-do-form input[name="name"]') as HTMLInputElement)?.value;
        const updatedUser = (document.querySelector('#edit-to-do-form input[name="user"]') as HTMLInputElement)?.value;
        const updatedStatus = (document.querySelector('#edit-to-do-form select[name="status"]') as HTMLSelectElement)?.value;
        const updatedPriority = (document.querySelector('#edit-to-do-form select[name="priority"]') as HTMLSelectElement)?.value;
        const updatedDate = (document.querySelector('#edit-to-do-form input[name="date"]') as HTMLInputElement)?.value;
        const updatedDescription = (document.querySelector('#edit-to-do-form textarea[name="description"]') as HTMLTextAreaElement)?.value;

        const dateFunctions = new DateFunctions();
        const formattedDate = dateFunctions.formatDate(updatedDate)

        console.log(updatedName, updatedUser, updatedStatus, updatedPriority,updatedDate, updatedDescription);

        document.querySelector('[data-to-do-info="name"]')!.textContent = updatedName;
        document.querySelector('[data-to-do-info="user"]')!.textContent = updatedUser;
        document.querySelector('[data-to-do-info="status"]')!.textContent = updatedStatus;
        document.querySelector('[data-to-do-info="priority"]')!.textContent = updatedPriority;
        document.querySelector('[data-to-do-info="date"]')!.textContent = formattedDate;
        document.querySelector('[data-to-do-info="description"]')!.textContent = updatedDescription;
        
        this.editToDoModal?.close();
    }
}

