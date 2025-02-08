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
                camera: JSON.parse(row.data.Camera),
                id: row.data.id
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
        const newData = {
        data: {
            Nombre: data.name,
            Tarea: data.task,
            Prioridad: data.priority,
            Fecha: new Date().toDateString(),
            Guids: JSON.stringify(data.ifcGuids),
            Camera: data.camera ? JSON.stringify(data.camera) : "",
            Id: data.id,
            Acciones: "",
            
        },
        }
        todoTable.data = [...todoTable.data, newData]
        todoTable.dataTransform = {
            Acciones: (_, rowData) => {
                return BUI.html`
                    <div style="display: flex; gap: 8px;">
                        <bim-button 
                            @click=${() => {
                                const id = rowData.Id
                                todoCreator.deleteTodo(id as string)
                                todoTable.data = todoTable.data.filter(value => value.data.Id !== id)
                            }}
                            icon="material-symbols:delete" style="background-color: red"
                        ></bim-button>
                        <bim-button
                            @click=${() => {
                                const id = rowData.Id
                                todoCreator.addTodoMaker(id as string, true)}}
                            icon="ion:navigate"
                        ></bim-button>
                        <bim-button
                            @click=${() => {
                                
                            }}
                            icon="pajamas:abuse"
                        ></bim-button>
                    </div>
                `
            }
        }
        todoTable.hiddenColumns = ["Guids","Camera", "Id"];
        
    }

    const todoCreator = components.get(TodoCreator)
    todoCreator.onTodoCreated.add((data) => addTodo(data))
    

    React.useEffect(() => {
        dashboard.current?.appendChild(todoTable)
        const [todoButton, todoPriorityButton, showMarkersButton] = todoTool({ components })
        todoContainer.current?.appendChild( todoButton )
        todoContainer.current?.appendChild( todoPriorityButton )
        todoContainer.current?.appendChild( showMarkersButton )

        todoCreator.onDisposed.add(()=>{
            todoTable.data=[]
            todoTable.remove()
            todoButton.remove()
            todoPriorityButton.remove()
            showMarkersButton.remove()
        })
    }, [])
    
    return (
        <div className="page" id="project-details" data-project-id="">
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
                    flexBasis: "35%",
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
                            <bim-label style={{fontSize: "var(--font-lg)", color: "#fff", paddingRight: "15px", alignItems: "center"}}>Tarea</bim-label>
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
                                    <bim-text-input placeholder="Busqueda..."></bim-text-input>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ flexBasis: "65%" }}>
                    < IFCViewer components={components} />
                </div>
                
            </div>
        </div>
)
}