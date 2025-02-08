import * as React from 'react'
import { ToDo, statusColors, priorityColors } from '../classes/ToDo';
import { ToDoManager } from '../classes/ToDoManager';
import * as Router from 'react-router-dom'
import { Modals } from '../classes/Modals';
import { DateFunctions } from '../classes/DateFunctions';

interface Props {
    todo: ToDo
    todoManager: ToDoManager;
}

export function ToDoItem(props: Props){
    const colorStatus = statusColors[props.todo.status]
    const colorPriority = priorityColors[props.todo.priority]
    const toDoId = props.todo.id;

    const mod = new Modals()
    const dataFunctions = new DateFunctions()

    // Poder editar el ToDo:
    const [editableTodo, setEditableTodo] = React.useState({
        name: props.todo.name,
        user: props.todo.user,
        status: props.todo.status,
        priority: props.todo.priority,
        date: props.todo.date,
        description: props.todo.description,
    });

    const [isEditing, setIsEditing] = React.useState(false);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'date') {
            const formattedDate = dataFunctions.formatDate(value);
            setEditableTodo((prev) => ({ ...prev, [name]: formattedDate }));
        } else {
            setEditableTodo((prev) => ({ ...prev, [name]: value }));
        }
    };

    //Eventos

    //Borrar:
    const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        mod.show("delete-to-do");
    }
    const acceptDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        mod.close("delete-to-do");
        props.todoManager.deleteToDo(toDoId)
    }
    const rejectDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        mod.close("delete-to-do");
        mod.show("edit-to-do");
    }
    const onOpenClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        mod.show("edit-to-do");
    }
    const toggleEditMode = () => {
        setIsEditing(true)
    }

    const saveToDoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        props.todoManager.saveToDoChanges(toDoId, editableTodo);
        setIsEditing(false);
    }

    const onFormEditTodo = (event: React.FormEvent) => {
        event.preventDefault();
    };


    return(
        <>
            <dialog id="edit-to-do">
                <form onSubmit={(e) =>{onFormEditTodo(e)}} className="to-do-content">
                    <h2>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                style={{ textAlign: "center" }}
                                value={editableTodo.name}
                                onChange={handleInputChange}
                                placeholder="Sin Nombre el ToDo"
                            />
                        ) : (
                            editableTodo.name || 'Sin Nombre el ToDo'
                        )}
                    </h2>
                    <div className="info">
                        <div className="label">
                        <p className="label-name">Usuario:</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="user"
                                    style={{ textAlign: "center" }}
                                    value={editableTodo.user}
                                    onChange={handleInputChange}
                                    placeholder="Usuario no disponible"
                                />
                            ) : (
                                <p className="label-value">
                                    {editableTodo.user || 'Usuario no disponible'}
                                </p>
                            )}
                        </div>
                        <div className="label">
                            <p className="label-name">Estado:</p>
                            {isEditing ? (
                                <select
                                    name="status"
                                    value={editableTodo.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="Activa">Activa</option>
                                    <option value="Cerrada">Cerrada</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="En Proceso">En Proceso</option>
                                </select>
                            ) : (
                                <p className="label-value">
                                    {editableTodo.status || 'Estado no disponible'}
                                </p>
                            )}
                        </div>
                        <div className="label">
                            <p className="label-name">Prioridad:</p>
                            {isEditing ? (
                                <select
                                    name="priority"
                                    value={editableTodo.priority}
                                    onChange={handleInputChange}
                                >
                                    <option value="N/A">N/A</option>
                                    <option value="Baja">Baja</option>
                                    <option value="Media">Media</option>
                                    <option value="Alta">Alta</option>
                                </select>
                            ) : (
                                <p className="label-value">
                                    {editableTodo.priority || 'Prioridad no disponible'}
                                </p>
                            )}
                        </div>
                        <div className="label">
                            <p className="label-name">Fecha de Finalización:</p>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="date"
                                    value={dataFunctions.formatDateToInput(editableTodo.date)}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <p className="label-value">
                                    {editableTodo.date || 'Fecha no disponible'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="info">
                        <p className="label-name">Descripción:</p>
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={editableTodo.description}
                                onChange={handleInputChange}
                                placeholder="Descripción no disponible"
                            />
                        ) : (
                            <p className="label-value-description">
                                {editableTodo.description || 'Descripción no disponible'}
                            </p>
                        )}
                    </div>
                    <div className="buttons">
                        {isEditing ? (
                            <button type="submit" onClick={saveToDoClick} id="save-to-do-btn">
                                <span className="material-symbols-outlined">save</span>Guardar
                            </button>
                        ) : (
                            <button type="button" onClick={toggleEditMode} id="edit-to-do-btn">
                                <span className="material-symbols-outlined">edit</span>Editar
                            </button>
                        )}
                        <button type="button" onClick={onDeleteClick} id="delete-to-do-btn">
                            <span className="material-symbols-outlined">delete</span>Borrar
                        </button>
                        <button
                            type="button"
                            onClick={() => mod.close('edit-to-do')}
                            id="close-to-do-btn"
                        >
                            <span className="material-symbols-outlined">close</span>Cerrar
                        </button>
                    </div>
                </form>
            </dialog>
            <dialog id="delete-to-do">
                <div className="popup-content" style={{ border: "none", padding: 0 }}>
                    <div
                        id="to-do-delete"
                        style={{ backgroundColor: "var(--complementary-light)" }}
                    >
                        <div
                        style={{
                            padding: 15,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        >
                        <span
                            style={{ fontSize: 40, marginRight: 10 }}
                            className="material-symbols-outlined"
                        >
                            warning
                        </span>
                        <h2 style={{ margin: 0 }}>Advertencia</h2>
                        </div>
                        <div style={{ padding: 15 }}>
                        <p>
                            Este a punto de borrar el To-Do: {props.todo.name}. Este proceso es
                            irreversible.
                        </p>
                        </div>
                        <div
                        style={{
                            padding: 15,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                        >
                        <button onClick={(e) => rejectDeleteClick(e)}
                            className="button-delete" id="close-delete">
                            Rechazar
                        </button>
                        <button onClick={(e) => acceptDeleteClick(e)}
                            className="button-delete" id="accept-delete">
                            Borrar
                        </button>
                        </div>
                    </div>
                </div>
            </dialog>
            <div className='to-do-item'
                style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: colorPriority
                }}
                data-to-do-id={toDoId}
            >
                <div style={{ display: "flex", columnGap: 15, alignItems: "center" }}>
                <button onClick={onOpenClick}
                    className="show-more-to-do"
                    data-to-do-id= {toDoId}
                    style={{ backgroundColor: colorStatus, padding: 10, borderRadius: 10 }}
                >
                    <span className="material-symbols-outlined">folder_open</span>
                </button>
                <p data-to-do-info="name">
                    {props.todo.name}
                </p>
                </div>
                <p data-to-do-info="date" style={{ textWrap: "nowrap", marginLeft: 10 }}>
                    {props.todo.date}
                </p>
                <div className="additional-info" style={{ display: "none" }}>
                    <p data-to-do-info="user">
                        {props.todo.user}
                    </p>
                    <p data-to-do-info="description">
                        {props.todo.description}
                    </p>
                    <p data-to-do-info="status">
                        {props.todo.status}
                    </p>
                    <p data-to-do-info="priority">
                        {props.todo.priority}
                    </p>
                </div>
            </div>
        </>
    )
}
