import * as React from 'react'
import { ToDoManager } from '../classes/ToDoManager';
import * as Router from 'react-router-dom'
import { ToDoItem } from './ToDoItem';
import { IToDo, ToDo, ToDoStatus, ToDoPriority } from '../classes/ToDo';
import { Modals } from '../classes/Modals';
import * as OBC from '@thatopen/components'
import { todoTool } from "../bim-components/TodoCreator/";

interface Props {
    toDoManager: ToDoManager;
    components: OBC.Components;
}

export function ToDoCard(props: Props){

    const [toDos,setToDos]= React.useState<ToDo[]>(props.toDoManager.list)
    props.toDoManager.onToDoCreated = () =>{setToDos([...props.toDoManager.list])}
    props.toDoManager.onToDoDeleted = () =>{setToDos([...props.toDoManager.list])}
    
    const ToDoCards = toDos.map((ToDo) =>{
        return (
            <ToDoItem key={ToDo.id} todo={ToDo} todoManager={props.toDoManager}/>
        )
    })

    const mod = new Modals()

    const onCancelClick = () =>{
        mod.close("new-to-do-modal");
    }
    const onNewToDoClick = () =>{
        mod.show("new-to-do-modal");
    }
    const onFormNewToDo = (event: React.FormEvent) => {
        const toDoForm = document.getElementById("new-to-do-form")
        if(!(toDoForm && toDoForm instanceof HTMLFormElement)){return}
        event.preventDefault()
        const formData = new FormData(toDoForm);
        const toDoData: IToDo = {
            name: formData.get("name") as string,
            user: formData.get("user") as string,
            description: formData.get("description") as string,
            priority: formData.get("priority") as ToDoPriority,
            status: formData.get("status") as ToDoStatus,
            date: formData.get("date") as string
        }
        try{
            const todo = props.toDoManager.newToDo(toDoData);
            toDoForm.reset()
            mod.close("new-to-do-modal");
        } catch(err){
            alert(err);
        }
    }
    /*
    const todoContainer = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        const todoButton = todoTool({ components: props.components });
        todoContainer.current?.appendChild(todoButton)
    }, []);
    */

    return(
        <>
            <dialog id="new-to-do-modal">
                <form onSubmit={(e) =>{onFormNewToDo(e)}} id="new-to-do-form">
                    <h2 style={{ textAlign: "center" }}>Añadir nueva tarea</h2>
                    <div className="input-list">
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">domain</span>Nombre
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Incluir el nombre a mostrar en el listado."
                        />
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">person_add</span>Usuario
                        </label>
                        <textarea
                            id="user"
                            name="user"
                            placeholder="Usuario a asignar."
                            defaultValue={""}
                        />
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">description</span>
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Breve descripción de la tarea en cuestion."
                            defaultValue={""}
                        />
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">priority</span>Prioridad
                        </label>
                        <select name="priority" id="priority">
                            <option value="N/A">N/A</option>
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
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
                            <option value="Activa">Activa</option>
                            <option value="En proceso">En proceso</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Entregada">Entregada</option>
                            <option value="Cerrada">Cerrada</option>
                        </select>
                        </div>
                        <div className="form-field-container">
                        <label>
                            <span className="material-symbols-outlined">calendar_month</span>
                            Fecha de Finalización
                        </label>
                        <input name="date-to-do" type="date" />
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
                        <button onClick={() => (document.getElementById('new-to-do-modal') as HTMLDialogElement).close()}
                            id="cancel-btn-to-do"
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
            <div
            className="dashboard-card"
            style={{ flexGrow: 1, padding: "30px 5px" }}
            >
                <div
                    style={{
                    padding: "20px 25px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                    }}
                >
                    <h2 style={{ color: "var(--primary)" }}>Tareas</h2>
                    <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        columnGap: 10,
                        justifyItems: "end"
                    }}
                        //ref={todoContainer}
                    >
                        <div
                            style={{
                            display: "flex",
                            alignItems: "center",
                            columnGap: 5,
                            position: "relative"
                            }}
                        >
                            <button>
                            <span
                                className="material-symbols-outlined"
                                id="search-advanced"
                            >
                                search
                            </span>
                            </button>
                            <input
                            id="search-to-do"
                            type="text"
                            placeholder="Buscar tarea por nombre."
                            style={{ width: "100%", paddingRight: 30 }}
                            />{" "}
                            {/* Añadí padding-right para que no cubra el ícono de "X" */}
                            <span
                            className="material-symbols-outlined"
                            id="search-clear"
                            style={{
                                display: "none",
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer"
                            }}
                            >
                            restart_alt
                            </span>
                        </div>
                    </div>
                    <button onClick={onNewToDoClick} id="new-to-do-btn">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
                <div id="to-do-list">
                    <div id="to-do-container"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "20px 20px",
                        rowGap: 20
                    }}
                    >{ToDoCards}</div>
                </div>
            </div>
        </>
    )
}
