import * as React from 'react'
import * as Router from 'react-router-dom'
import * as Firestore from 'firebase/firestore'
import { IProject, Project, ProjectStatus, ProjectType } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { ProjectCard } from './ProjectCard';
import { SearchBox } from './SearchBox';
import { getCollection } from "../firebase"
import { DateFunctions } from '../classes/DateFunctions';

interface Props {
    projectsManager: ProjectsManager
}
export function ProjectPage(props: Props){
    const [projects,setProjects]= React.useState<Project[]>(props.projectsManager.list)
    props.projectsManager.onProjectCreated = () =>{setProjects([...props.projectsManager.list])}
    
    const projectCards = projects.map((project) =>{
        return ( // REVISAR
            /*
            <Router.Link to='/project/:id' key ={project.id}>
                < ProjectCard project = {project} />
            </Router.Link>
            */
            <ProjectCard project = {project} key ={project.id} />
        )
    })
    
    const dateFunctions = new DateFunctions()
    const projectsCollection = getCollection<IProject>("/projects")
    const getFirestoneProjects = async () => {
        const firebaseProjects = await Firestore.getDocs(projectsCollection)
        for (const doc of firebaseProjects.docs){
            const data = doc.data()
            const fecha = dateFunctions.formatDateFirebase((data.date as unknown as Firestore.Timestamp).toDate() as Date)
            const project: IProject = {
                ...data,
                date: fecha
            }
            try{
                props.projectsManager.newProject(project, doc.id)
            }catch (error){

            }
        }
    }

    React.useEffect(()=>{
        getFirestoneProjects()
    }, [])
    
    const onNewProjectClick = () => {
        const modal = document.getElementById("new-project-modal");
        if(modal && modal instanceof HTMLDialogElement){
            modal.showModal();
        }
    }
    const onFormSubmitProject= (event: React.FormEvent) => {
        const projectForm = document.getElementById("new-project-form")
        if(!(projectForm && projectForm instanceof HTMLFormElement)){return}
        event.preventDefault()
        const formData = new FormData(projectForm);
        const projectData: IProject = {
            name: formData.get("name") as string,
            code: formData.get("code") as string,
            description: formData.get("description") as string,
            type: formData.get("type") as ProjectType,
            status: formData.get("status") as ProjectStatus,
            budget: Number((formData.get("budget") as string).replace('€', '').replace(',', '.')),
            date: formData.get("date") as string, // revisar
            progress: 0
        }
        if(!props.projectsManager.checkProject(projectData)) {
        } else {
            try{
                Firestore.addDoc(projectsCollection, projectData)
                const project = props.projectsManager.newProject(projectData);
                projectForm.reset()
                const modal = document.getElementById("new-project-modal");
                if(modal && modal instanceof HTMLDialogElement){
                    modal.close();
                }
            } catch(err){
                alert(err);
            }
        }
    }
    const onImportProjecClick = () =>{
        const btn = document.getElementById('import-project-btn')
        if (btn) {
            props.projectsManager.importToJSON()
            }
        }
    const onExportProjecClick = () =>{
        const btn = document.getElementById('export-project-btn')
        if (btn) {
            props.projectsManager.exportToJSON(projects)
            }
    }

    const closeErrorDialog = () =>{
        (document.getElementById('error-dialog') as HTMLDialogElement).close();
    }

    const onProjectSearch = (value: string) => {
        setProjects(props.projectsManager.filterProjects(value))
    }

    return (
        <div id="content">
            <dialog id="new-project-modal">
                <form onSubmit={(e) =>{onFormSubmitProject(e)}} id="new-project-form">
                    <h2 style={{ textAlign: "center" }}>Nuevo Proyecto</h2>
                    <div className="input-list">
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">domain</span>Nombre
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Incluir el nombre del proyecto."
                        />
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">tag</span>Código
                        </label>
                        <input
                            name="code"
                            type="text"
                            placeholder="Incluir el código de proyecto."
                        />
                        <p
                            style={{
                            color: "#969696",
                            fontSize: "var(--font-sm)",
                            fontStyle: "italic",
                            marginTop: 2
                            }}
                        >
                            Nota: Incluir el código de imputación.
                        </p>
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">description</span>
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Breve descripción de las tareas del proyecto."
                            defaultValue={""}
                        />
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">architecture</span>Tipo
                        </label>
                        <select name="type" id="type">
                            <option value="Implantación Interna">Implantación Interna</option>
                            <option value="Implantación Externa">Implantación Externa</option>
                            <option value="Desarrollo de Proyecto">
                            Desarrollo de Proyecto
                            </option>
                            <option value="Asistencia Técnica">Asistencia Técnica</option>
                        </select>
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">
                            not_listed_location
                            </span>
                            Estado
                        </label>
                        <select name="status" id="status">
                            <option value="Oferta">Oferta</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Activa">Activa</option>
                            <option value="Entregada">Entregada</option>
                            <option value="Finalizada">Finalizada</option>
                        </select>
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">euro_symbol</span>
                            Presupuesto
                        </label>
                        <input name="budget" id="budget" />
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">calendar_month</span>
                            Fecha de Finalización
                        </label>
                        <input name="date" type="date" />
                        <p
                            style={{
                            color: "#969696",
                            fontSize: "var(--font-sm)",
                            fontStyle: "italic",
                            marginTop: 2
                            }}
                        >
                            Nota: Si no se especifíca fecha se incluirá la del día de hoy.
                        </p>
                        </div>
                        <div
                        style={{
                            display: "flex",
                            margin: "10px 0px 10px auto",
                            columnGap: 15
                        }}
                        >
                        <button onClick={() => (document.getElementById('new-project-modal') as HTMLDialogElement).close()}
                            id="cancel-btn-project"
                            type="button"
                            style={{
                            backgroundColor: "transparent",
                            color: "var(--complementary-light)"
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{ backgroundColor: "var(--complementary-light)" }}
                        >
                            Aceptar
                        </button>
                        </div>
                    </div>
                </form>
            </dialog>
            <dialog id="error-dialog">
                <form
                id="custom-error"
                style={{ backgroundColor: "var(--complementary-light)" }}
                >
                <div
                    style={{
                    padding: 15,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                    }}
                >
                    <span style={{ fontSize: 40 }} className="material-symbols-outlined">
                    warning
                    </span>
                    <h2 style={{ padding: "0px 15px 0px 15px", borderBottom: 0 }}>Error</h2>
                </div>
                <div style={{ padding: 15 }}>
                    <p id="error-msg">Error Text</p>
                </div>
                <div
                    style={{
                    padding: 15,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                    }}
                >
                    <button onClick={closeErrorDialog}
                    id="accept-btn-error"
                    type="button"
                    style={{
                        backgroundColor: "var(--complementary-dark)",
                        color: "var(--complementary-light)",
                        border: "none",
                        outline: "none"
                    }}
                    >
                    Aceptar
                    </button>
                </div>
                </form>
            </dialog>
            <header>
                <SearchBox OnChange={(value) => onProjectSearch(value)}/>
                <button onClick={onImportProjecClick} id="import-project-btn" className="new-button">
                    <span className="material-symbols-outlined">publish</span>Importar JSON
                </button>
                <button onClick={onExportProjecClick} id="export-project-btn" className="new-button">
                    <span className="material-symbols-outlined">download</span>Descarga JSON
                </button>
                <button onClick={onNewProjectClick} id="new-project-btn" className="new-button">
                    <span className="material-symbols-outlined">add</span>Nuevo Proyecto
                </button>
            </header>
            <div className="page" id="projects-page" style={{display: 'flex'}}>
                {
                    projects.length > 0 ? <div id="project-list">{ projectCards }</div> : <p style={{padding: 10}}>No hay ningún proyecto que mostrar.</p> 
                }
                
            </div>
        </div>
    )
}

    
