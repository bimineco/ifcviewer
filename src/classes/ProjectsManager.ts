import { IProject, Project } from "./Project"
import { DateFunctions } from "./DateFunctions"
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
    ui: HTMLElement
    defaultProjectId: string | null = null;
    editProjectModal: HTMLDialogElement | null;
    // Auxiliar para To-dos:
    public projectCode: string | null; 

    constructor(container: HTMLElement){
        this.ui = container

        //Para poder editar:
        this.editProjectModal = document.getElementById('edit-project-details') as HTMLDialogElement | null
        
        const project = this.newProject({
            name: "Por Defecto",
            code: "800800",
            description: "N/A",
            type: "Implantación Interna" ,
            status: "Oferta",
            date: "12/12/2024"
        })
        project.ui.click()


        /* Bloquear Temporalmente 

        if(this.list.length == 0){
            this.createDefaultProject(); 
        }

        */
        this.initPageNavigation();
        
    }

    newProject(data: IProject) {
        const projectNames = this.list.map(
            (project) => { return project.name})
        const projectCodes = this.list.map(
            (project) => { return project.code})
        const nameInUse = projectNames.includes(data.name)
        if (nameInUse){
            throw new Error(`El proyecto con el nombre: "${data.name}" ya existe.`)
        }
        const codeInUse = projectCodes.includes(data.code)
        if (codeInUse){
            throw new Error(`El código: "${data.code}" del proyecto: "${data.name}" ya está en uso.`)
        }
        
        const project = new Project(data)
        
        
        project.ui.addEventListener("click", ()=>{
            const projectsPage = document.getElementById("projects-page")
            const detailsPage = document.getElementById("project-details")
            if (!projectsPage || !detailsPage) {return}
            projectsPage.style.display = "none"
            detailsPage.style.display = "flex"
            this.setDetailsPage(project)
        })


        this.ui.append(project.ui)
        this.list.push(project)

        //Borrar el proyecto por defecto.
        if (this.defaultProjectId) {
            this.deleteProject(this.defaultProjectId);
            this.defaultProjectId = null;
        }
        return project
    }
    private setDetailsPage(project: Project){
        const detailPage = document.getElementById("project-details")
        if (!detailPage) {return}

        const dashboardCard = detailPage.querySelector('.dashboard-card') as HTMLElement;
        dashboardCard.setAttribute('data-project-id', project.id);

        for (const prop in project){
            const data = detailPage.querySelector(`[data-project-info='${prop}']`) as HTMLElement;
            if(!data) {continue;}
            data.textContent = project[prop].toString();

            if(prop === "progress"){
                data.textContent+= "%"
                data.style.width = `${project.progress.toString()}%`;
            }
            if(prop === "budget"){
                data.textContent+="€"
            }
        }
        // Revisar si lo necesito para los ToDos
        this.projectCode = project.code
        console.log(this.projectCode)   
    }

    private initPageNavigation() {
        document.getElementById("projects-nav-btn")?.addEventListener("click", () => {
            this.pageNavigator("projects-page");
        });

        document.getElementById("examples-nav-btn")?.addEventListener("click", () => {
            this.pageNavigator("examples-page");
        });
    }

    pageNavigator(id: string) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            if (page instanceof HTMLElement) {
                page.style.display = page.id === id ? 'flex' : 'none';
            }
        });
    }
    createDefaultProject(){

        //Fecha del día actual:
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        let startDate = `${day}/${month}/${year}`; 

        const defaultData : IProject ={
            name: "Por Defecto",
            code: "800800",
            description: "N/A",
            type: "Implantación Interna" ,
            status: "Oferta",
            date: startDate
        }

        const defaultProject = this.newProject(defaultData);
        this.defaultProjectId = defaultProject.id
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
        project.ui.remove()
        const remaining = this.list.filter( (project) => {
            return project.id !== id
        })
        this.list = remaining
    }

    exportToJSON(fileName: string = "projects"){

        function replacer(key, value) { 
            if (key === "ui") {return undefined;}
            return value}
        
        const projectDetails = (document.querySelector('#project-details') as HTMLElement);
        let updatedProject = null 
        console.log(projectDetails.style.display)
        if (projectDetails && projectDetails.style.display !== 'none') {
            const code = projectDetails.querySelector('[data-project-info="code"]')?.textContent;
            console.log(code)
            if (code) {
                updatedProject = {
                    name: projectDetails.querySelector('[data-project-info="name"]')?.textContent ?? '',
                    code: code ?? '',
                    description: projectDetails.querySelector('[data-project-info="description"]')?.textContent ?? '',
                    type: projectDetails.querySelector('[data-project-info="type"]')?.textContent as "Implantación Interna" | "Implantación Externa" | "Desarrollo de Proyecto" | "Asistencia Técnica" ?? '',
                    status: projectDetails.querySelector('[data-project-info="status"]')?.textContent as "Oferta" | "Pendiente" | "Activa" | "Entregada" | "Finalizada" ?? '',
                    date: projectDetails.querySelector('[data-project-info="date"]')?.textContent ?? '',
                    id: projectDetails.querySelector('[data-project-info="id"]')?.textContent ?? '',
                    budget: parseFloat((projectDetails.querySelector('[data-project-info="budget"]')?.textContent ?? '').replace('€', '').trim()) || 0,
                    progress: parseFloat((projectDetails.querySelector('[data-project-info="progress"]')?.textContent ?? '').replace('%', '').trim()) || 0,
                };
            }
        }
        
        const toDos = projectDetails.querySelectorAll('.to-do-item');
        
        let toDoList : ToDo[] = [];
        toDos?.forEach((toDoElement) => {
            const ToDo: ToDo = {
                name: toDoElement.querySelector('[data-to-do-info="name"]')?.textContent ?? '',
                user: toDoElement.querySelector('[data-to-do-info="user"]')?.textContent ?? '',
                description: toDoElement.querySelector('[data-to-do-info="description"]')?.textContent ?? toDoElement.querySelector('.description')?.textContent ?? '',
                status: toDoElement.querySelector('[data-to-do-info="status"]')?.textContent as ToDoStatus ?? toDoElement.querySelector('.status')?.textContent as ToDoStatus,
                priority: toDoElement.querySelector('[data-to-do-info="priority"]')?.textContent as ToDoPriority ?? toDoElement.querySelector('.priority')?.textContent as ToDoPriority,
                date: toDoElement.querySelector('[data-to-do-info="date"]')?.textContent ?? '',
                id: toDoElement.getAttribute('data-to-do-id') ?? '',
            };
            toDoList.push(ToDo);
            console.log(ToDo)
        });

        const dataToExport = {
            projects: this.list.map((project) => {
                if (updatedProject && project.code === updatedProject.code) {
                    const mergedProject = {
                        ...project,
                        name: updatedProject!.name || project.name,
                        description: updatedProject!.description || project.description,
                        type: updatedProject!.type || project.type,
                        status: updatedProject!.status || project.status,
                        date: updatedProject!.date || project.date,
                        id: updatedProject!.id || project.id,
                        budget: updatedProject!.budget || project.budget,
                        progress: updatedProject!.progress || project.progress,
                        toDos: toDoList  
                };
                return mergedProject;
                }      
                //Pendiente de ver como voy a guardar los todos cuando el proyecto
                //no está visible.
                const projectToDos = toDoList.filter((toDo) => toDo.id.startsWith(project.code));
                return {
                ...project,
                toDos: projectToDos
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

                        existingProject.name = project.name || existingProject.name;
                        existingProject.code = project.code || existingProject.code;
                        existingProject.description = project.description || existingProject.description;
                        existingProject.type = project.type || existingProject.type;
                        existingProject.status = project.status || existingProject.status;
                        existingProject.date = project.date || existingProject.date;
                        existingProject.budget = project.budget || existingProject.budget;
                        existingProject.progress = project.progress || existingProject.progress;

                        const projectDetail = document.querySelector('#project-details');
                        if (projectDetail) {
                            const toDos = projectDetail?.querySelectorAll('.to-do-item');
                            if (toDos) {
                                for (const toDo of  project.toDos) {
                                    const existingToDo = Array.from(toDos).find(t => t.getAttribute('data-to-do-id') === toDo.id);
                                    if (existingToDo) {
                                        this.setTextIfExists(existingToDo.querySelector('[data-to-do-info="name"]'), toDo.name);
                                        this.setTextIfExists(existingToDo.querySelector('[data-to-do-info="user"]'), toDo.user);
                                        this.setTextIfExists(existingToDo.querySelector('[data-to-do-info="description"]'), toDo.description);
                                        this.setTextIfExists(existingToDo.querySelector('[data-to-do-info="status"]'), toDo.status);
                                        this.setTextIfExists(existingToDo.querySelector('[data-to-do-info="priority"]'), toDo.priority);
                                        this.setTextIfExists(existingToDo.querySelector('[data-to-do-info="date"]'), toDo.date);
                                        const toDoButton = existingToDo.querySelector('.show-more-to-do') as HTMLButtonElement;
                                        if (toDoButton) {
                                            toDoButton.setAttribute('data-to-do-id', toDo.id);
                                        }
                                    }
                                }
                            }
                        } 
                    } else {
                        this.newProject(project);
                        let idCounter = 1;
                        project.toDos.forEach((toDo) => {
                            const container: HTMLElement = document.getElementById('to-do-container') ?? document.body;
                            if (container) {
                                const toDoManager = new ToDoManager(container!);
                                
                                // Si no hay ID en el toDo:
                                const generatedId = `${project.code}-${String(idCounter).padStart(3, '0')}`;
                                idCounter++;  
                                
                                const toDoData: IToDo ={
                                    ...toDo,
                                    id: toDo.id ?? generatedId
                                }
                                toDoManager.newToDo(toDoData);
                            } else {
                                console.error('No se encontró el contenedor de To-Dos');
                            }
                        })
                    }
                }
            })
            reader.readAsText(fileList[0]);
        }
        input.addEventListener('change', cargaJson);
        input.click()
    }

    // Editar el proyecto:

    getCurrentProject(): Project | null {
        const porjectDetails = document.getElementById("project-details");
        const projectId = porjectDetails?.querySelector('[data-project-id]')?.getAttribute('data-project-id');
        console.log(projectId)
        if (!projectId) {
            console.error("No se pudo obtener el ID del proyecto actual.");
            return null;
        }
        return this.list.find(project => project.id === projectId) || null;
    }

    EditProjectModal(project: Project){
        if (!this.editProjectModal) {return}
        
        const projectDetails = document.querySelector('#project-details');
        if (!projectDetails) {return}

        const projectName = projectDetails.querySelector('[data-project-info="name"]')?.textContent || '';
        const projectCode = projectDetails.querySelector('[data-project-info="code"]')?.textContent || '';
        const projectDescription = projectDetails.querySelector('[data-project-info="description"]')?.textContent || '';
        const projectType = projectDetails.querySelector('[data-project-info="type"]')?.textContent || '';
        const projectStatus = projectDetails.querySelector('[data-project-info="status"]')?.textContent || '';
        const projectBudget = projectDetails.querySelector('[data-project-info="budget"]')?.textContent || '';
        const projectDate = projectDetails.querySelector('[data-project-info="date"]')?.textContent || '';
        const projectProgress = projectDetails.querySelector('[data-project-info="progress"]')?.textContent || '';


        const dateFunctions = new DateFunctions();
        const formattedDate = dateFunctions.formatDateToInput(projectDate);


        console.log(projectName, projectCode, projectDescription, projectType, projectStatus, projectBudget, projectDate, projectProgress);

        this.editProjectModal.innerHTML = `
            <form id="edit-project-form">
                <h2>Editar Proyecto</h2>
                <div class="input-list">
                    <div class="form-field-container">
                        <label>Nombre</label>
                        <input name="name" type="text" value="${projectName}" placeholder="Nombre del proyecto">
                    </div>
                    <div class="form-field-container">
                        <label>Código</label>
                        <input name="code" type="text" value="${projectCode}" placeholder="Código del proyecto">
                    </div>
                    <div class="form-field-container">
                        <label>Descripción</label>
                        <textarea name="description" placeholder="Descripción del proyecto">${projectDescription}</textarea>
                    </div>
                    <div class="form-field-container">
                        <label>Tipo</label>
                        <select name="type">
                            <option value="Implantación Interna" ${projectType === 'Implantación Interna' ? 'selected' : ''}>Implantación Interna</option>
                            <option value="Implantación Externa" ${projectType === 'Implantación Externa' ? 'selected' : ''}>Implantación Externa</option>
                            <option value="Desarrollo de Proyecto" ${projectType === 'Desarrollo de Proyecto' ? 'selected' : ''}>Desarrollo de Proyecto</option>
                            <option value="Asistencia Técnica" ${projectType === 'Asistencia Técnica' ? 'selected' : ''}>Asistencia Técnica</option>
                        </select>
                    </div>
                    <div class="form-field-container">
                        <label>Estado</label>
                        <select name="status">
                            <option value="Oferta" ${projectStatus === 'Oferta' ? 'selected' : ''}>Oferta</option>
                            <option value="Pendiente" ${projectStatus === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="Activa" ${projectStatus === 'Activa' ? 'selected' : ''}>Activa</option>
                            <option value="Entregada" ${projectStatus === 'Entregada' ? 'selected' : ''}>Entregada</option>
                            <option value="Finalizada" ${projectStatus === 'Finalizada' ? 'selected' : ''}>Finalizada</option>
                        </select>
                    </div>
                    <div class="form-field-container">
                        <label>Presupuesto</label>
                        <input name="budget" type="text" value="${projectBudget}">
                    </div>
                    <div class="form-field-container">
                        <label>Fecha de Finalización</label>
                        <input name="date" type="date" value="${formattedDate}">
                    </div>
                    <div class="form-field-container">
                        <label>Progreso</label>
                        <input name="progress" type="text" value="${projectProgress}">
                    </div>
                    <div style="display: flex; margin: 10px 0px 10px auto; column-gap: 15px;">
                        <button id="cancel-edit-btn" type="button" style="background-color: transparent; color: var(--complementary-light)">Cancelar</button>
                        <button type="submit" style="background-color:var(--complementary-light);">Guardar Cambios</button>
                    </div>
                </div>
            </form>
        `;
        

        this.editProjectModal.showModal();

        document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
            this.editProjectModal?.close();
        });

        document.getElementById('edit-project-form')?.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Formulario enviado, llamando a saveProjectChanges'); // Depuración
            this.saveProjectChanges();
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
    
    saveProjectChanges() {
        
        
        const updatedName = (document.querySelector('#edit-project-form input[name="name"]') as HTMLInputElement)?.value;
        const updatedCode = (document.querySelector('#edit-project-form input[name="code"]') as HTMLInputElement)?.value;
        const updatedDescription = (document.querySelector('#edit-project-form textarea[name="description"]') as HTMLTextAreaElement)?.value;
        const updatedType = (document.querySelector('#edit-project-form select[name="type"]') as HTMLSelectElement)?.value;
        const updatedStatus = (document.querySelector('#edit-project-form select[name="status"]') as HTMLSelectElement)?.value;
        const updatedBudget = (document.querySelector('#edit-project-form input[name="budget"]') as HTMLInputElement)?.value;
        const updatedDate = (document.querySelector('#edit-project-form input[name="date"]') as HTMLInputElement)?.value;
        const updatedProgress = (document.querySelector('#edit-project-form input[name="progress"]') as HTMLInputElement)?.value;

        if(!this.isValidProgress(updatedProgress) || !updatedProgress.endsWith('%')){
            this.showErrorDialog (`El progeso debe estar entre 0 y 100%.`)
        }
        
        const dateFunctions = new DateFunctions();
        const formattedDate = dateFunctions.formatDate(updatedDate)

        console.log(updatedName, updatedCode, updatedDescription, updatedType, updatedStatus, updatedBudget, updatedDate, updatedProgress);

        const projectDetails = document.querySelector('#project-details');
        if (!projectDetails) {return}

        projectDetails.querySelector('[data-project-info="name"]')!.textContent  = updatedName;
        projectDetails.querySelector('[data-project-info="code"]')!.textContent = updatedCode;
        projectDetails.querySelector('[data-project-info="description"]')!.textContent = updatedDescription;
        projectDetails.querySelector('[data-project-info="type"]')!.textContent = updatedType;
        projectDetails.querySelector('[data-project-info="status"]')!.textContent = updatedStatus;
        projectDetails.querySelector('[data-project-info="budget"]')!.textContent = updatedBudget;
        projectDetails.querySelector('[data-project-info="date"]')!.textContent  = formattedDate;
        

        //Asegurarmen que existe el elemento de progreso:
        const progressElement = projectDetails.querySelector('[data-project-info="progress"]');
        if (progressElement) {
            (progressElement as HTMLElement).textContent = updatedProgress;
            (progressElement as HTMLElement).style.width = updatedProgress;
        } else {
            console.error('Elemento de progreso no encontrado');
            this.showErrorDialog('Elemento de progreso no encontrado.');
        }

        this.editProjectModal?.close();

    }
}