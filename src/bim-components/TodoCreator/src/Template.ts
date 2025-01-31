import * as OBC from "@thatopen/components"
import * as OBCF from "@thatopen/components-front"
import * as BUI from "@thatopen/ui"
import { TodoCreator } from "./TodoCreator"
import { TodoInput, Priority } from "./base-types"

export interface TodoUIState {
        components: OBC.Components
}

export const todoTool = (state: TodoUIState) => {
        const { components } = state
        const todoCreator = components.get(TodoCreator)
        
        const nameInput = document.createElement("bim-text-input")
        nameInput.label = "Nombre"

        const taskInput = document.createElement("bim-text-input")
        taskInput.label = "Tarea"

        const priorityInput = BUI.Component.create<BUI.Dropdown>(() => {
                return BUI.html`
                <bim-dropdown label="Priority">
                        <bim-option Label="Baja" checked></bim-option>
                        <bim-option Label="Media"></bim-option>
                        <bim-option Label="Alta"></bim-option>
                </bim-dropdown>
                `
        })

        const todoModal = BUI.Component.create<HTMLDialogElement>(() => {
                return BUI.html`
                <dialog>
                        <bim-panel style="width:20rem;">
                                <bim-panel-section label="Nueva Tarea" fixed>
                                        <bim-label>Incluir los siguientes datos:</bim-label>
                                        ${nameInput}
                                        ${taskInput}
                                        ${priorityInput}	
                                        <bim-button 
                                                label="Generar una nueva tarea" 
                                                @click=${() => {
                                                        const todoValue: TodoInput = {
                                                                name:nameInput.value,
                                                                task:taskInput.value,
                                                                priority: priorityInput.value[0] as Priority
                                                        }
                                                        if(!todoValue) {return}
                                                        todoCreator.addTodo(todoValue)
                                                        nameInput.value = ""
                                                        taskInput.value = ""
                                                        todoModal.close()
                                                }}
                                        ></bim-button>
                                </bim-panel-section>
                        </bim-panel>
                </dialog>
                `
        })

        document.body.appendChild(todoModal)

        const onTogglePriority = (event: Event) => {
                const btn = event.target as BUI.Button
                btn.active = !btn.active
                todoCreator.enablePriorityHighlight = btn.active
        }

        const todoPriorityButton = BUI.Component.create<BUI.Button>(() => {        
                return BUI.html`
                <bim-button
                        icon="iconoir:fill-color"
                        tooltip-title="Modificar la prioridad"
                        @click=${onTogglePriority}
                ></bim-button>
                `
        })

        const todoButton = BUI.Component.create<BUI.Button>(() => {
                return BUI.html`
                <bim-button
                @click=${() => todoModal.showModal()}
                icon="pajamas:todo-done"
                tooltip-title="To-Do"
                ></bim-button>
                `
        })
        return [todoButton, todoPriorityButton]
        }