import * as React from "react";
import * as Router from "react-router-dom";
import { ProjectsManager } from "../classes/ProjectsManager";
import { IFCViewer } from "./IFCViewer";
import { deleteDocument } from "../firebase";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import { TodoCreator, todoTool } from "../bim-components/TodoCreator/";
import { ref } from "firebase/database";
import { TodoData } from "../bim-components/TodoCreator/src/base-types";

interface Props {
    projectsManager: ProjectsManager
}

export function TOC(props: Props) {
    // Forzado para encontrar un proyecto en la base de datos
    const projects = props.projectsManager.list
    const project = projects.find(project => project.name === 'Default');
    if (!project) {return (<p>The project with ID {project} wasn't found.</p>)}
    console.log(project)

    const components: OBC.Components = new OBC.Components()
    
    const dashboard = React.useRef<HTMLDivElement>(null)
    const todoContainer = React.useRef<HTMLDivElement>(null)
    
    const navigateTo = Router.useNavigate()
    
    const onRowCreated = (event) => {
        event.stopImmediatePropagation()
        const { row } = event.detail;
        const originalColor = row.style.backgroundColor;
        row.addEventListener("click", async() => {
            todoCreator.highlightTodo({
                name: row.data.Name,
                task: row.data.Task,
                priority: row.data.Priority,
                ifcGuids: JSON.parse(row.data.Guids),
                camera: JSON.parse(row.data.Camera)
            })
        })
        row.addEventListener("mouseover", () => { 
            row.style.backgroundColor = "gray" 
        })
        row.addEventListener("mouseout", () => { 
            row.style.backgroundColor = originalColor;
        })
        }
        

    const todoTable = BUI.Component.create<BUI.Table>(() => {
        return BUI.html`
            <bim-table @rowcreated=${onRowCreated}></bim-table>`
    })
    

    const addTodo = (data: TodoData) => {
        console.log(data)
        const newData = {
        data: {
            Name: data.name,
            Task: data.task,
            Priority: data.priority,
            Date: new Date().toDateString(),
            Guids: JSON.stringify(data.ifcGuids),
            Camera: data.camera ? JSON.stringify(data.camera) : ""
        },
        }
        todoTable.data = [...todoTable.data, newData]
        todoTable.hiddenColumns = ["Guids","Camera"];
    }

    const todoCreator = components.get(TodoCreator)
    todoCreator.onTodoCreated.add((data) => addTodo(data))

    React.useEffect(() => {
        dashboard.current?.appendChild(todoTable)
        const [todoButton, todoPriorityButton] = todoTool({ components })
        todoContainer.current?.appendChild( todoButton )
        todoContainer.current?.appendChild( todoPriorityButton )
    }, [])
    
    return (
        <div className="page" id="project-details" data-project-id="">
            <dialog id="edit-project-details">
                <form id="edit-project-form">
                    <h2 style={{ textAlign: "center" }}>Editar Proyecto</h2>
                    <div className="input-list">
                        <div className="form-field-container">
                        <label>Nombre</label>
                        <input
                            name="name"
                            type="text"
                            defaultValue= {project.name}
                            placeholder="Nombre del proyecto"
                        />
                        </div>
                        <div className="form-field-container">
                        <label>Código</label>
                        <input
                            name="code"
                            type="text"
                            defaultValue= {project.code}
                            placeholder="Código del proyecto"
                        />
                        </div>
                        <div className="form-field-container">
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            defaultValue={project.description}
                        />
                        </div>
                        <div className="form-field-container">
                            <label>Tipo</label>
                            <select name="type" defaultValue={project.type}>
                                <option value="Implantación Interna" >Implantación Interna</option>
                                <option value="Implantación Externa" >Implantación Externa</option>
                                <option value="Desarrollo de Proyecto" >Desarrollo de Proyecto</option>
                                <option value="Asistencia Técnica" >Asistencia Técnica</option>
                            </select>
                        </div>
                        <div className="form-field-container">
                            <label>Estado</label>
                            <select name="status" defaultValue={project.status}>
                                <option value="Oferta" >Oferta</option>
                                <option value="Pendiente" >Pendiente</option>
                                <option value="Activa" >Activa</option>
                                <option value="Entregada" >Entregada</option>
                                <option value="Finalizada" >Finalizada</option>
                            </select>
                        </div>
                        <div className="form-field-container">
                            <label>Presupuesto</label>
                            <input name="budget" type="text" defaultValue={`${project.budget} €`} />
                        </div>
                        <div className="form-field-container">
                            <label>Fecha de Finalización</label>
                            <input name="date" type="date" defaultValue={'18/02/2025'} />
                        </div>
                        <div className="form-field-container">
                            <label>Progreso</label>
                            <input name="progress" type="text" defaultValue={`${project.progress} %`}/>
                        </div>
                        <div style={{ display: "flex", margin: "10px 0px 10px auto", columnGap: 15 }}>
                            <button
                            id="cancel-edit-btn"
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
                            Guardar Cambios
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
                    <button
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
            <header style={{ display: "flex", flexDirection: "column", padding: 0 }}>
                <h2 data-project-info="name">{project.name}</h2>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <p data-project-info="description" style={{ color: "#212E3F", width: "75%", paddingLeft: "50px" }}>
                        {project.description}
                    </p>
                    <button >
                        <span className="material-symbols-outlined">delete</span>Borrar
                    </button>
                </div>
            </header>
            <div className="main-page-content" style={{ display: "flex", gap: 20 }}>
                <div
                    style={{
                    flexBasis: "60%",
                    display: "flex",
                    flexDirection: "column",
                    rowGap: 30
                    }}>
                    <div className="dashboard-card" style={{ padding: "30px 5px" }}>
                        <div
                            className="card-header"
                            style={{ alignSelf: "auto", justifyContent: "space-between" }}
                        >
                            <p
                            style={{
                                fontSize: 10,
                                backgroundColor: "var(--complementary-dark)",
                                padding: 20,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 8,
                                aspectRatio: 1
                            }}
                            >
                            CÓDIGO
                            </p>
                            <p
                            id="project-code"
                            data-project-info="code"
                            style={{ color: "#969696", fontSize: "var(--font-2xl)" }}
                            >
                            {project.code}
                            </p>
                            <button id="edit-project-btn" className="secondary-button">
                                <p style={{ width: "100%" }}>Editar</p>
                            </button>
                        </div>
                        <div className="card-content">
                            <div className="card-property">
                                <p style={{ color: "#969696", fontSize: "var(--font-xl)" }}>
                                    Estado
                                </p>
                                <p data-project-info="status">{project.status}</p>
                                </div>
                                <div className="card-property">
                                <p style={{ color: "#969696", fontSize: "var(--font-xl)" }}>
                                    Tipo
                                </p>
                                <p data-project-info="type">{project.type}</p>
                                </div>
                                <div className="card-property">
                                <p style={{ color: "#969696", fontSize: "var(--font-xl)" }}>
                                    Presupuesto
                                </p>
                                <p data-project-info="budget">{project.budget}€</p>
                                </div>
                                <div className="card-property">
                                <p style={{ color: "#969696", fontSize: "var(--font-xl)" }}>
                                    Fecha de Finalización
                                </p>
                                <p data-project-info="date">{project.date}</p>
                                </div>
                                <div className="card-property">
                                <p style={{ color: "#969696", fontSize: "var(--font-xl)" }}>
                                    Progreso
                                </p>
                            </div>
                        </div>
                        <div
                        style={{
                            backgroundColor: "var(--background-white)",
                            borderRadius: 999,
                            overflow: "auto",
                            width: "100%"
                        }}>
                            <div
                                data-project-info="progress"
                                style={{
                                backgroundColor: "green",
                                width: `${project.progress}%`,
                                padding: "5px 0",
                                textAlign: "center"
                                }}
                            >
                                {project.progress} %
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-card" style={{ flexGrow: 1, padding:"5px" }} ref={dashboard}>
                        <div
                        style={{
                            padding: "20px 30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}
                        >
                            <bim-label style={{fontSize: "var(--font-lg", color: "#fff"}}>To-Do</bim-label>
                            <div
                                style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "end",
                                columnGap: 20
                                }}
                                ref={todoContainer}
                            >
                                <div
                                style={{ display: "flex", alignItems: "center", columnGap: 10 }}
                                >
                                    <bim-label icon="material-symbols:search" style={{ color: "#fff" }}></bim-label>
                                    <bim-text-input placeholder="Search To-Do's by name"></bim-text-input>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ flexBasis: "50%" }}>
                    < IFCViewer components={components} />
                </div>
                
            </div>
        </div>
)
}