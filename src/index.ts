import { IProject, ProjectStatus, ProjectType } from "./classes/Project"
import { ProjectsManager} from "./classes/ProjectsManager"
import { IToDo, ToDoStatus, ToDoPriority } from "./classes/ToDo";
import { ToDoManager } from "./classes/ToDoManager";
import { DateFunctions } from "./classes/DateFunctions"

// Funciones
function showModal(id: string) {
    const modal = document.getElementById(id);
    if(modal && modal instanceof HTMLDialogElement){
        modal.showModal();
    }else{
        console.warn(" The provided ID was not found. ID: ", id);
    }
}
function closeModal(id: string) {
    const modal = document.getElementById(id);
    if(modal && modal instanceof HTMLDialogElement){
        modal.close();
    }else{
        console.warn(" The provided ID was not found. ID: ", id);
    }
}
function toggleModal(id: string) {
    const modal = document.getElementById(id);
    if(modal && modal instanceof HTMLDialogElement){
        if (modal.open){
            modal.close();
        }else{
            modal.showModal()
        }
    }else{
        console.warn(" The provided ID was not found. ID: ", id);
    }
}

function launchError(msg: string){
    const modal = document.getElementById("error-dialog");
    if(modal && modal instanceof HTMLDialogElement){
        const placeholderElement = document.getElementById("error-msg");
        if(placeholderElement) {placeholderElement.innerHTML = msg}
        else{console.log("Error: No encontrado donde incluir el error.")}
        if (!modal.open) {
            modal.showModal();
        }
    }
    
}

// Seleccionar el boton
const newProjectBtn = document.getElementById('new-project-btn');
if(newProjectBtn){
    newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")});
} else{
    console.warn("New Project Button not Found");
}
// Botón de cancelar errores
const cancel = document.getElementById('cancel-btn');

// Botón de cancelar Proyecto:
const cancelProject = document.getElementById('cancel-btn-project');
if(cancelProject){
    cancelProject.addEventListener("click", () => {closeModal("new-project-modal")});
} else{
    console.warn("Cancel Button not Found");
}

// Seleccionar el formulario:
const projectListUI = document.getElementById("project-list") as HTMLElement;
const projectsManager = new ProjectsManager(projectListUI);

const projectForm = document.getElementById('new-project-form');
if (projectForm && projectForm instanceof HTMLFormElement){
    projectForm.addEventListener('submit', (event)=>{
        event.preventDefault()
        const formData = new FormData(projectForm);
        const projectData: IProject = {
            name: formData.get("name") as string,
            code: formData.get("code") as string,
            description: formData.get("description") as string,
            type: formData.get("type") as ProjectType,
            status: formData.get("status") as ProjectStatus,
            date: new Date(formData.get("date") as string)
        }
        try{
            const project = projectsManager.newProject(projectData);
            projectForm.reset()
            toggleModal("new-project-modal")
        } catch(err){
            launchError(err);
        }
    })
        cancel?.addEventListener('click', (event)=>{
            projectForm.reset();
            toggleModal("new-project-modal");
        })
    } else {
    console.warn("The project form was not found. Check the ID!");
}

// Exportar e Importar JSON:

const exportProjectsBtn = document.getElementById('export-project-btn')
if (exportProjectsBtn) {
    exportProjectsBtn.addEventListener('click', () => {
        projectsManager.exportToJSON()
    })
}

const importProjectsBtn = document.getElementById('import-project-btn')
if (importProjectsBtn) {
    importProjectsBtn.addEventListener('click', () => {
        projectsManager.importToJSON()
    })
}

// Editar el proyecto:

const editProjectBtn = document.getElementById('edit-project-btn')
    if (editProjectBtn) {
        editProjectBtn.addEventListener('click', () =>{
            const editProject = projectsManager.getCurrentProject()
            //console.log(editProject)
            if (editProject){
                projectsManager.EditProjectModal(editProject)
            }   
        })
}

// Añadir To-Do:

const newToDoBtn = document.getElementById('new-to-do-btn');
if (newToDoBtn){
    newToDoBtn.addEventListener('click', () => {
        showModal("new-to-do-modal")})
    }else{ console.warn("New To-Do Button not Found")
}

// Ampliar información To-Do:
window.onload = function() {
    const showMoreBtn = document.getElementById('show-more-to-do-btn');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
        console.log("Evento agregado correctamente");
        const showToDo = toDoManager.showPopupToDo();
        });
    } else {
        console.log("Botón no encontrado");
    }
};

// Botón de cancelar to-dp:
const cancelToDo = document.getElementById('cancel-btn-to-do');
if(cancelToDo){
    cancelToDo.addEventListener("click", () => {closeModal("new-to-do-modal")});
} else{
    console.warn("Cancel Button not Found");
}

const toDoListUI = document.getElementById("to-do-container") as HTMLElement
const toDoManager = new ToDoManager(toDoListUI);

const toDoForm = document.getElementById('new-to-do-form');
if (toDoForm && toDoForm instanceof HTMLFormElement){
    toDoForm.addEventListener('submit', (event)=>{
        event.preventDefault()
        const formData = new FormData(toDoForm);
        const toDoData: IToDo = {
            name: formData.get("name") as string,
            user: formData.get("user") as string,
            description: formData.get("description") as string,
            status: formData.get("status") as ToDoStatus,
            priority: formData.get("priority") as ToDoPriority,
            date: new Date(formData.get("date") as string)
        }
        try{
            const toDo = toDoManager.newToDo(toDoData);
            toDoForm.reset()
            toggleModal("new-to-do-modal")
        } catch(err){
            launchError(err);
        }
    })
        cancel?.addEventListener('click', (event)=>{
            toDoForm.reset();
            toggleModal("new-to-do-modal");
        })
    } else {
    console.warn("The to-do form was not found. Check the ID!");
}

// Editar el to-do:

const editToDoBtn = document.getElementById('edit-to-do-btn')
    if (editToDoBtn) {
        editToDoBtn.addEventListener('click', () =>{
            const editTodo = toDoManager.getcurrentToDo()
            if (editTodo){
                toDoManager.EditToDoModal(editTodo)
            }   
        })
}