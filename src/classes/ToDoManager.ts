import {IToDo, ToDo, statusColors, priorityColors} from "./ToDo"
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
        this.editToDoModal = document.getElementById('edit-to-do') as HTMLDialogElement | null

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

    // Borrar
    deleteToDo(id: string) {
        const toDo = this.getToDo(id)
        if (!toDo){return}
        toDo.ui.remove()
        const remaining = this.list.filter( (toDo) => {
            return toDo.id !== id
        })
        this.list = remaining
    }
    deletePopUp(toDoId: string){
        const toDoElement = document.querySelector(`[data-to-do-id="${toDoId}"]`);
        if (!toDoElement) {
            console.error(`No se encontró el To-Do con id: ${toDoId}`);
            return;
        }
        const toDoName = toDoElement.querySelector('[data-to-do-info="name"]')?.textContent;
        const deletePopup = document.createElement('div');
        deletePopup.classList.add('popup');
        deletePopup.innerHTML = `
        <div class="popup-content" style="border:none; padding: 0px">
            <div id="to-do-delete" style="background-color: var(--complementary-light);">
                <div style="padding: 15px; display: flex; flex-direction: row; align-items: center; justify-content: center;">
                    <span style="font-size: 40px; margin-right: 10px;" class="material-symbols-outlined">warning</span>
                    <h2 style="margin: 0;">Advertencia</h2> 
                </div>
                <div style="padding: 15px;">
                    <p>Este a punto de borrar el To-Do: ${toDoName}. Este proceso es irreversible.</p>
                </div>
                <div style="padding: 15px; display: flex; justify-content: space-between; align-items: center">
                    <button class="button-delete" id="close-delete">Rechazar</button>  
                    <button class="button-delete" id="accept-delete">Borrar</button>
                </div>
            </div>
            `;
        document.body.appendChild(deletePopup);
        deletePopup.style.display = 'flex';

        const closeBtn = document.getElementById('close-delete') as HTMLButtonElement;
            closeBtn?.addEventListener('click', () => {
            deletePopup.remove();
            this.showPopUpToDo(toDoId)
        });
        const deleteBtn = document.getElementById('accept-delete') as HTMLButtonElement;
        deleteBtn?.addEventListener('click', () => {
            this.deleteToDo(toDoId);
            deletePopup.remove();
        })
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
        
        this.correlativo++; 
        
        //console.log('ID del to-do generado:', todoId);
        return todoId
        
    }

    // Mostrar más información del to-do:

    showPopUpToDo(toDoId: string) {
    // Obtener el to-do:
    const toDoElement = document.querySelector(`[data-to-do-id="${toDoId}"]`);
    if (!toDoElement) {
        console.error(`No se encontró el To-Do con id: ${toDoId}`);
        return;
    }

    //Obtener la información del to-do:    
    const toDoName = toDoElement.querySelector('[data-to-do-info="name"]')?.textContent;
    const toDoUser = toDoElement.querySelector('[data-to-do-info="user"]')?.textContent;
    const toDoStatus = toDoElement.querySelector('[data-to-do-info="status"]')?.textContent;
    const toDoPriority = toDoElement.querySelector('[data-to-do-info="priority"]')?.textContent;
    const toDoDate = toDoElement.querySelector('[data-to-do-info="date"]')?.textContent;
    const toDoDescription = toDoElement.querySelector('[data-to-do-info="description"]')?.textContent;
    
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
    <div class="popup-content">
        <h2>${toDoName}</h2>
        <div class="info">
            <div class="label">
                <p class="label-name">Usuario:</p>
                <p class="label-value">${toDoUser || 'Usuario no disponible'}</p>
            </div>
            <div class="label">
                <p class="label-name">Estado:</p>
                <p class="label-value">${toDoStatus || 'Estado no disponible'}</p>
            </div>
            <div class="label">
                <p class="label-name">Prioridad:</p>
                <p class="label-value">${toDoPriority || 'Prioridad no disponible'}</p>
            </div>
            <div class="label">
                <p class="label-name">Fecha de Finalización:</p>
                <p class="label-value">${toDoDate || 'Fecha no disponible'}</p>
            </div>
        </div>
        <div class="info">
            <p class="label-name">Descripción:</p>
            <p class="label-value-description">${toDoDescription || 'Descripción no disponible'}</p>
        </div>
        <div class="buttons">
            <div style="display: flex;">
                <button id="edit-to-do-btn"><span class="material-symbols-outlined">edit</span>Editar</button>
                <button id="delete-to-do-btn"><span class="material-symbols-outlined">delete</span>Borrar</button>
            </div>
            <button id="close-to-do-btn"><span class="material-symbols-outlined">close</span>Cerrar</button>
        </div>
    </div>
    `;

    document.body.appendChild(popup);

    const closeBtn = document.getElementById('close-to-do-btn') as HTMLButtonElement;
    closeBtn?.addEventListener('click', () => {
        popup.remove();
    });

    const deleteBtn = document.getElementById('delete-to-do-btn') as HTMLButtonElement;
    deleteBtn?.addEventListener('click', () => {
        this.deletePopUp(toDoId);
        popup.remove();
    })
    const editBtn = document.getElementById('edit-to-do-btn') as HTMLButtonElement;
    editBtn?.addEventListener('click', () => {
        if (popup) {
            popup.style.display = 'none';
        }
        const toDo = this.getToDo(toDoId);
        if (toDo) {
        this.EditToDoModal(toDo);
        }
    });
    return popup
    }
    
    checkPopUp() {
        const popup = (document.querySelector('.popup') as HTMLDivElement);
        if (popup) {
            popup.remove();
        }
    }

    viewPopUp(id: string) {
        const popup = (document.querySelector('.popup') as HTMLDivElement);
        if (popup) {   
            popup.style.display = 'flex';
        }else{
            this.showPopUpToDo(id); 
        }
    }

    // Editar una to-do:
    getcurrentToDo(): ToDo | null {

        const toDoId = document.querySelector('[data-to-do-id]')?.getAttribute('data-to-do-id');
        if (!toDoId) {
            console.error("No se pudo obtener el ID del To-Do actual.");
            return null;
        }
        return this.list.find(toDo => toDo.id === toDoId) || null;
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

    EditToDoModal(toDo: ToDo){
        if (!this.editToDoModal) {return}

        const toDoName = toDo.name || ''; 
        const toDoUser = toDo.user || '';
        const toDoStatus = toDo.status || '';
        const toDoPriority = toDo.priority || '';
        const toDoDate = toDo.date || '';
        const toDoDescription = toDo.description || '';

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
                    <textarea name="user" placeholder="Usuario a asignar.">${toDoUser}</textarea>
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
                        <option value="N/A" ${toDoPriority === 'N/A' ? 'selected' : ''}>N/A</option>
                        <option value="Baja" ${toDoPriority === 'Baja' ? 'selected' : ''}>Baja</option>
                        <option value="Media" ${toDoPriority === 'Media' ? 'selected' : ''}>Media</option>
                        <option value="Alta" ${toDoPriority === 'Alta' ? 'selected' : ''}>Alta</option>
                    </select>
                    </div>
                    <div class="form-field-container">
                    <label><span class="material-symbols-outlined">calendar_month</span>Fecha de Finalización</label>
                    <input name="date" type="date" value="${formattedDate}">
                    </div>
                    <div class="form-field-container">
                    <label><span class="material-symbols-outlined">description</span>Descripción</label>
                    <textarea name="description" placeholder="Breve descripción de la tarea en cuestion.">${toDoDescription}</textarea>
                    </div>
                    <div style="display: flex; margin: 10px 0px 10px auto; column-gap: 15px;">
                    <button id="cancel-edit-btn" type="button" style="background-color: transparent; color: var(--complementary-light)">Cancelar</button>
                    <button type="submit" style="background-color:var(--complementary-light);">Guardar cambios</button>
                    </div>
                </div>
            </form>
        `;
        

        this.editToDoModal.showModal();
        const toDoId = toDo.id || '';

        const cancelBtnEdit = document.getElementById('cancel-edit-btn') as HTMLButtonElement;
        cancelBtnEdit?.addEventListener('click', () => {
            this.editToDoModal?.close();
            this.viewPopUp(toDoId);
            
        });

        document.getElementById('edit-to-do-form')?.addEventListener('submit', (event) => {
            event.preventDefault();    
            this.saveToDoChanges(toDoId);
            this.updateColors(toDo);
            this.viewPopUp(toDoId);
        });
    }
    saveToDoChanges(toDoId: string) {
        const updatedName = (document.querySelector('#edit-to-do-form input[name="name"]') as HTMLInputElement)?.value.trim();
        const updatedUser = (document.querySelector('#edit-to-do-form textarea[name="user"]') as HTMLTextAreaElement)?.value.trim();
        const updatedStatus = (document.querySelector('#edit-to-do-form select[name="status"]') as HTMLSelectElement)?.value;
        let updatedPriority = (document.querySelector('#edit-to-do-form select[name="priority"]') as HTMLSelectElement)?.value;
        const updatedDate = (document.querySelector('#edit-to-do-form input[name="date"]') as HTMLInputElement)?.value;
        const updatedDescription = (document.querySelector('#edit-to-do-form textarea[name="description"]') as HTMLTextAreaElement)?.value.trim();
        
        const dateFunctions = new DateFunctions();
        const formattedDate = dateFunctions.formatDate(updatedDate);
        
        if (updatedStatus === 'Cerrada') {
            updatedPriority = 'N/A';
        }


        // Obtener el To-Do existente
        const toDo = this.getToDo(toDoId);
        if (toDo) {
            toDo.name = updatedName;
            toDo.user = updatedUser;    
            toDo.status = updatedStatus;
            toDo.priority = updatedPriority;
            toDo.date = formattedDate;
            toDo.description = updatedDescription;
            
            // Actualizar el DOM con los nuevos valores
            const toDoElement = document.querySelector(`[data-to-do-id="${toDoId}"]`);
            if (toDoElement) {
                toDoElement.querySelector('[data-to-do-info="name"]')!.textContent = toDo.name;
                toDoElement.querySelector('[data-to-do-info="user"]')!.textContent = toDo.user || "N/A";
                toDoElement.querySelector('[data-to-do-info="status"]')!.textContent = toDo.status;
                toDoElement.querySelector('[data-to-do-info="priority"]')!.textContent = toDo.priority;
                toDoElement.querySelector('[data-to-do-info="date"]')!.textContent = formattedDate;
                toDoElement.querySelector('[data-to-do-info="description"]')!.textContent = toDo.description;
            }
        } else {
            console.error(`No se encontró el To-Do con ID: ${toDoId}`);
            return; 
        }
        
        this.editToDoModal?.close();
        this.checkPopUp();
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

