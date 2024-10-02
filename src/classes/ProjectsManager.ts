import { IProject, Project } from "./Project"
import { DateFunctions } from "./DateFunctions"
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

        if(this.list.length == 0){
            this.createDefaultProject();
        }
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
            // Filtering out properties  
            if (key === "ui") {return undefined;}
            return value}
        const json = JSON.stringify(this.list, null, 2)
        const blob = new Blob([json],{type: 'application/json'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
    }
    importToJSON(fileName: string = "projects"){
        const input = document.createElement('input')
        input.type = 'file'
        input.accept ='application/json'
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            const json = reader.result
            if(!json) {return}
            const projects: IProject[] = JSON.parse(json as string)
            for (const project of projects) {
                try{
                    this.newProject(project)
                }catch (err){

                }
            }
        })
        input.addEventListener('change', () => {
            const fileList = input.files
            if (!fileList) {return}
            reader.readAsText(fileList[0])
        })
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
            const progressValue = updatedProgress.replace('%', ''); // Elimina el símbolo % de la cadena
            (progressElement as HTMLElement).style.width = `${progressValue}%`; // Asigna el valor numérico y la unidad de medida
            console.log(progressElement)
        } else {
            console.error('Elemento de progreso no encontrado');
            this.showErrorDialog('Elemento de progreso no encontrado.');
        }

        this.editProjectModal?.close();

    }
}