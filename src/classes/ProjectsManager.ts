import { IProject, Project } from "./Project"
export class ProjectsManager {
    list: Project[] = []
    ui: HTMLElement

    constructor(container: HTMLElement){
        this.ui = container
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
            throw new Error(`A project with the name: "${data.name}" already exists.`)
        }
        const codeInUse = projectCodes.includes(data.code)
        if (codeInUse){
            throw new Error(`A project with the code: "${data.code}" already exists.`)
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
        return project
    }
    private setDetailsPage(project: Project){
        const detailPage = document.getElementById("project-details")
        if (!detailPage) {return}

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

        const defaultData : IProject ={
            name: "Por Defecto",
            code: "800800",
            description: "N/A",
            type: "Implantación Interna" ,
            status: "Oferta",
            date: new Date()
        }

        this.newProject(defaultData);
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
}
