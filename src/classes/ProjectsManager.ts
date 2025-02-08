import { IProject, Project, ProjectType, ProjectStatus } from "./Project"
import { DateFunctions } from "./DateFunctions"
import { ErrorDialog } from './ErrorDialog'
import { ToDoStatus, ToDoPriority, IToDo } from "./ToDo"
import { ToDoManager } from "./ToDoManager"


interface ToDo {
    name: string;
    user: string;
    description: string;
    status: ToDoStatus;
    priority: ToDoPriority;
    date: string;
    id: string;
}
export class ProjectsManager {
    list: Project[] = []
    defaultProjectId: string | null = null;
    editProjectModal: HTMLDialogElement | null;
    // React
    onProjectCreated = (Project: Project) => {}
    onProjectDeleted = (id: string) => {}

    // Auxiliar para To-dos:
    public projectCode: string | null; 

    newProject(data: IProject, id?: string) {

    const existingProjectIndex = this.list.findIndex(project => project.id === id);

    if (existingProjectIndex !== -1) {
        const existingProject = this.list[existingProjectIndex];
        this.updateExistingProject(existingProject, data);
        
        return existingProject

    } else {
        const project = new Project(data, id)
        this.list.push(project)
        this.onProjectCreated(project)
        
        //Borrar el proyecto por defecto.
        if (this.defaultProjectId) {
            this.deleteProject(this.defaultProjectId);
            this.defaultProjectId = null;
        }
        return project
    }
    
    }
    
    createDefaultProject(){

        //Fecha del día actual:
        const dateFunctions = new DateFunctions()
        const startDate = dateFunctions.formatDateToInput(dateFunctions.todayDate());

        const defaultData : IProject ={
            name: "Por Defecto",
            code: "800800",
            description: "N/A",
            type: "Implantación Interna" ,
            status: "Oferta",
            budget: 100,
            date: startDate
        }

        const defaultProject = this.newProject(defaultData);
        if (defaultProject) {
            this.defaultProjectId = defaultProject.id;
        } else {
            console.error("No se pudo crear el proyecto por defecto");
        }
    }

    checkProject(data: IProject): boolean{
        const dialog = new ErrorDialog()
        if (data.name.length < 5) {
            dialog.showErrorDialog(`El proyecto con nombre: "${data.name}" tiene menos de cinco (5) caracteres.`)
            return false;
        }
        const projectNames = this.list.map(
            (project) => { return project.name})
        const projectCodes = this.list.map(
            (project) => { return project.code})
        const nameInUse = projectNames.includes(data.name)
        if (nameInUse){
            dialog.showErrorDialog(`El proyecto con el nombre: "${data.name}" ya existe.`)
            return false
        }
        const codeInUse = projectCodes.includes(data.code)
        if (codeInUse){
            dialog.showErrorDialog(`El código: "${data.code}" del proyecto: "${data.name}" ya está en uso.`)
            return false
        }
        return true
    }

    getProject(id: string){
        const project = this.list.find( (project) => {
            return project.id == id
        })
        return project
    }

    deleteProject(id: string){
        const project = this.getProject(id)
        if (!project){return}
        const remaining = this.list.filter( (project) => {
            return project.id !== id
        })
        this.list = remaining
        this.onProjectDeleted(id)
    }

    exportToJSON(projects: any[] , fileName: string = "projects"){

        function replacer(key, value) { 
            if (key === "ui") {return undefined;}
            return value}

        const dataToExport = {
            projects: projects.map((project) => {
                return {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    type: project.type, 
                    status: project.status, 
                    date: project.date,  
                    budget: project.budget,  
                    progress: project.progress,
                    toDos: project.toDos  
                };
            })
        };

        const json = JSON.stringify(dataToExport, replacer, 2)
        const blob = new Blob([json],{type: 'application/json'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
    }
    

    //Auxiliar:
    setTextIfExists(element: HTMLElement | null, text: string) {
        if (element) {
            element.textContent = text;
        }
    }

    private updateExistingProject(existingProject, project) {
        existingProject.name = project.name || existingProject.name;
        existingProject.code = project.code || existingProject.code;
        existingProject.description = project.description || existingProject.description;
        existingProject.type = project.type || existingProject.type;
        existingProject.status = project.status || existingProject.status;
        existingProject.date = project.date || existingProject.date;
        existingProject.budget = project.budget || existingProject.budget;
        existingProject.progress = project.progress || existingProject.progress;
    }

    importToJSON(fileName: string = "projects"){
        const existingInput = document.querySelector('input[type="file"]');
        if (existingInput) {
            console.warn('El input ya existe. No se creará uno nuevo.');
            return;
        }
        const input = document.createElement('input')
        input.type = 'file'
        input.accept ='application/json'

        const cargaJson = (event: Event) => {
            const fileList = input.files;
            if (!fileList) return; 
            const reader = new FileReader()
            reader.addEventListener('load', () => {

                const json = reader.result
                if(!json) {return}
                const data = JSON.parse(json as string)
                const projects = data.projects;

                for (const project of projects) {
                    const existingProject = this.list.find(p => p.id === project.id);
                    console.log("Buscando proyecto con id:", project.id);
                    console.log("Proyecto existente:", existingProject);
                    if (existingProject) {
                        console.log(existingProject)
                        this.updateExistingProject(existingProject, project);
                    } else {
                        const dateFunctions = new DateFunctions()
                        const newDate = dateFunctions.formatDateAAAAMMDD(project.date)
                        project.date = newDate
                        this.newProject(project);
                    }
                }
            })
            reader.readAsText(fileList[0]);
        }
        input.addEventListener('change', cargaJson);
        input.click()
    }

    // Editar el proyecto:

    EditProjectModal(project: Project, updateProjectCallback: (updatedProject: Project) => void){

        const editProjectModal = document.getElementById('edit-project-details') as HTMLDialogElement | null
        if (!editProjectModal) {return}
        
        const projectDetails = document.querySelector('#project-details');
        if (!projectDetails) {return}

        editProjectModal.showModal();

        document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
            editProjectModal?.close();
        });
        const dateFunctions = new DateFunctions

        document.getElementById('edit-project-form')?.addEventListener('submit', (event) => {
            event.preventDefault();
            // Capturar los valores actualizados del formulario
            const updatedProject: Project = {
            ...project,
            name: (document.querySelector('input[name="name"]') as HTMLInputElement)?.value,
            code: (document.querySelector('input[name="code"]') as HTMLInputElement)?.value,
            description: (document.querySelector('textarea[name="description"]') as HTMLTextAreaElement)?.value,
            type: (document.querySelector('select[name="type"]') as HTMLSelectElement)?.value as ProjectType,
            status: (document.querySelector('select[name="status"]') as HTMLSelectElement)?.value as ProjectStatus,
            budget: parseFloat((document.querySelector('input[name="budget"]') as HTMLInputElement)?.value.replace('€', '').trim()),
            date: dateFunctions.formatDate((document.querySelector('input[name="date"]') as HTMLInputElement)?.value),
            progress: parseFloat((document.querySelector('input[name="progress"]') as HTMLInputElement)?.value.replace('%', '').trim()),
            };
        // Llamar a la función de callback para devolver el proyecto actualizado
        updateProjectCallback(updatedProject);
        // Cerrar el modal
        editProjectModal?.close();
        });
    }
    isValidProgress(value) {
        const progress = parseFloat(value); 
    
        if (!isNaN(progress) && progress >= 0 && progress <= 100) {
            return true; 
        }
        return false;
    }
    
    showErrorDialog(message) {
        const errorDialog = document.getElementById('error-dialog') as HTMLDialogElement;
        const errorMsg = document.getElementById('error-msg');
    
        if (errorMsg) {
            errorMsg.textContent = message;
        }
        
        if (errorDialog) {
            errorDialog.showModal();
            
            
            document.getElementById('cancel-btn')?.addEventListener('click', () => {
                errorDialog.close();
                this.editProjectModal?.showModal();
            });
        }
    }
    
    saveProjectChanges(updatedProject: Project) {
        // Buscar y actualizar el proyecto en la lista interna de proyectos
        let project = this.list.find(p => p.id === updatedProject.id);
        if (!project) {
            this.showErrorDialog('No se pudo encontrar el proyecto para guardar los cambios.');
            return;
        }

        if (!this.isValidProgress(updatedProject.progress)) {
            this.showErrorDialog(`El progreso debe estar entre 0 y 100%.`);
            return;
        }
        const dateFunctions = new DateFunctions

        // Actualizar los datos del proyecto
        project = { ...project, ...updatedProject };
        
        // Actualizar la vista en el detalle del proyecto
        
        const projectDetails = document.querySelector('#project-details');
        if (!projectDetails) return;

        projectDetails.querySelector('[data-project-info="name"]')!.textContent = updatedProject.name;
        projectDetails.querySelector('[data-project-info="code"]')!.textContent = updatedProject.code;
        projectDetails.querySelector('[data-project-info="description"]')!.textContent = updatedProject.description;
        projectDetails.querySelector('[data-project-info="type"]')!.textContent = updatedProject.type;
        projectDetails.querySelector('[data-project-info="status"]')!.textContent = updatedProject.status;
        projectDetails.querySelector('[data-project-info="budget"]')!.textContent = `${updatedProject.budget}€`;
        projectDetails.querySelector('[data-project-info="date"]')!.textContent = updatedProject.date;

        const progressElement = projectDetails.querySelector('[data-project-info="progress"]');
        if (progressElement) {
            progressElement.textContent = `${updatedProject.progress}%`;
            (progressElement as HTMLElement).style.width = `${updatedProject.progress}%`;
        }
    }
    // Filter Projects

    filterProjects(value:string){
        const filteredProjects = this.list.filter((project) =>{
            return project.name.includes(value)
        })
        return filteredProjects
    }

}