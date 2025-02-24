import * as React from 'react';
import * as ReactDom from 'react-dom/client';
import * as Router from 'react-router-dom';
import { Sidebar } from './react-components/Sidebar';
import { ProjectPage } from './react-components/ProjectPage';
import { ProjectDetailsPage } from './react-components/ProjectDetailsPage';
import { UserPage } from './react-components/UserPage';
import { ProjectsManager} from "./classes/ProjectsManager"
import * as BUI from "@thatopen/ui"
import * as OBC from '@thatopen/components'

import { IFCViewer } from './react-components/IFCViewer';
import { TOC } from './react-components/TOC';

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Welcome } from './react-components/Welcome';


import { IFCViewerOld } from './react-components/IFCViewerOld';
import { IFCViewerToolbar } from "../BORRAR/IFCViewerToolbar";

BUI.Manager.init()

declare global{
    namespace JSX{
        interface IntrinsicElements{
            "bim-grid":any;
            "bim-label": any;
            "bim-button": any;
            "bim-text-input": any;
            "bim-viewport": any;
            "bim-panel": any;
            //"bim-panel-section": any;
            "bim-table": any;
            "bim-dropdown": any;
            "bim-option": any;
            
        }
    }
}

const components = new OBC.Components();
const projectsManager = new ProjectsManager()

/*--------------------- REACT: ---------------------------*/

const rootElement = document.getElementById("app") as HTMLDivElement
const appRoot = ReactDom.createRoot(rootElement)

onAuthStateChanged(auth, (user) => {
    if (user) {
        appRoot.render(
            <Router.BrowserRouter>
                <Sidebar />
                <Router.Routes>
                    <Router.Route path="/" element={<ProjectPage projectsManager={projectsManager} />} />
                    <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManager} components={components} />} />
                    <Router.Route path="/users" element={<UserPage />} />
                    <Router.Route path="/viewer" element={<IFCViewerToolbar components={components} />} />
                    <Router.Route path="/cv" element={<IFCViewer components={components} />} />
                    <Router.Route path="/toc" element={<TOC projectsManager={projectsManager} />} />
                </Router.Routes>
            </Router.BrowserRouter>
        );
    } else {
        appRoot.render(<Welcome />);
    }
});

/*
const rootElement = document.getElementById("app") as HTMLDivElement
const appRoot = ReactDom.createRoot(rootElement)
appRoot.render(
    <>
        <Router.BrowserRouter>
            < Sidebar />
            <Router.Routes>
                <Router.Route path="/" element={< ProjectPage projectsManager={projectsManager} />}/>
                <Router.Route path="/project/:id" element={< ProjectDetailsPage projectsManager={projectsManager} components={components}/>}/>    
                <Router.Route path="/users" element={< UserPage />}/>
                <Router.Route path="/viewer" element={< IFCViewer components={components}/>}/>        
            </Router.Routes>
        </Router.BrowserRouter>
    </>
)

*/

/*--------------------- MODALS: --------------------------
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

/*--------------------- PROJECTS: --------------------------

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
            if (editProject){
                projectsManager.EditProjectModal(editProject)
            }   
        })
}

/*--------------------- TO-DOS: --------------------------

// Añadir To-Do:
const newToDoBtn = document.getElementById('new-to-do-btn');
if (newToDoBtn){
    newToDoBtn.addEventListener('click', () => {
        showModal("new-to-do-modal")});
    }else{ console.warn("New To-Do Button not Found")
}

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

// Mostrar más información && Editar To-Do:

toDoListUI.addEventListener('mouseenter', () => {
    document.querySelectorAll('.show-more-to-do').forEach(button => {
        if (!(button as HTMLElement).getAttribute('data-event-added')) {
            button.addEventListener('click', function() {
                const toDoId = (this as HTMLElement).getAttribute('data-to-do-id');
                console.log(`ID del To-Do: ${toDoId}`);
                if (toDoId !==null) {
                    const popToDo = toDoManager.showPopUpToDo(toDoId);
                    const toDo = toDoManager.getToDo(toDoId);
                    if (toDo && popToDo) {
                        const editBtn = popToDo.querySelector('#edit-to-do-btn');
                        if (editBtn) {
                            editBtn.addEventListener('click', () => {
                                toDoManager.EditToDoModal(toDo);
                                console.log("Se ha llamado a la función editToDoModal");
                            });
                        } else {
                            console.error("No se encontró el botón de editar en el popup.");
                        }
                        const closeBtn = popToDo.querySelector('#close-to-do-btn');
                        if (closeBtn) {
                            closeBtn.addEventListener('click', () => {
                                popToDo.remove();
                            });
                        } else {
                            console.error("No se encontró el botón de cerrar en el popup.");
                        }
                    } else {
                        console.error("No se encontró el To-Do con ID:", toDoId);
                    }
                }   
            });
            (button as HTMLElement).setAttribute('data-event-added', 'true');
        }
    });
});

// Usar Filtros:
document.addEventListener('DOMContentLoaded', () => {
    const filter = (document.getElementById('search-to-do') as HTMLInputElement);
    const clearButton = document.getElementById('search-clear') as HTMLSpanElement;
    if (filter) {
        filter.addEventListener('input', (event) => {
            const filterValue = (event.target as HTMLInputElement).value;
            toDoManager.filterToDos(filterValue);
            if (filterValue.length > 0) {
                clearButton.style.display = 'inline';
            } else {
                clearButton.style.display = 'none';
            }
        });
        clearButton.addEventListener('click', () => {
            filter.value = ''; 
            clearButton.style.display = 'none'; 
            toDoManager.filterToDos('');
        });

        filter.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                filter.value = ''; 
                clearButton.style.display = 'none'; 
                toDoManager.filterToDos(''); 
            }
        });
    };
})

const filterAdvancedBtn = (document.getElementById('search-advanced') as HTMLSpanElement)
if (filterAdvancedBtn) {
    filterAdvancedBtn.addEventListener('click', () => {
        toDoManager.filterAdvanced();
    });
}
*/