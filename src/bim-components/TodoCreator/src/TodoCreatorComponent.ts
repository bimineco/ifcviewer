import * as OBC from "@thatopen/components"

export class TodoCreatorComponent extends OBC.Component {
    static uuid = "fe04ded6-f563-472b-8d4c-467c308320cd"
    enabled = true

    constructor(components: OBC.Components) {
        super(components)
        this.components.add(TodoCreatorComponent.uuid, this)
    }

    addTodo() {
        console.log("Adding A Todo")
    }
}