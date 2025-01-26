import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import { TodoCreatorComponent } from "./TodoCreatorComponent"

export interface TodoUIState {
    components: OBC.Components
}

export const todoTool = (state: TodoUIState) => {
    const { components } = state
    const todoCreator = components.get(TodoCreatorComponent)
    
    return BUI.Component.create<BUI.Button>(() => {
        return BUI.html`
        <bim-button
            @click=${() => todoCreator.addTodo()}
            icon="pajamas:todo-done"
            tooltip-title="To-Do"
        ></bim-button>
        `
    })
}