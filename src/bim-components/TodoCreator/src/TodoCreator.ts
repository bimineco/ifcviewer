import * as OBC from "@thatopen/components"
import * as OBCF from "@thatopen/components-front"
import * as THREE from "three"
import { TodoData, TodoInput } from "./base-types"

export class TodoCreator extends OBC.Component {
    static uuid = "fe04ded6-f563-472b-8d4c-467c308320cd"
    enabled = true
    private _world: OBC.World
    private _list: TodoData[] = []
    onTodoCreated = new OBC.Event<TodoData>()

    constructor(components: OBC.Components) {
        super(components)
        this.components.add(TodoCreator.uuid, this)
    }
    setup() {
        const highlighter = this.components.get(OBCF.Highlighter)
        highlighter.add(`${TodoCreator.uuid}-priority-Baja`, new THREE.Color(0x59bc59))
        highlighter.add(`${TodoCreator.uuid}-priority-Media`, new THREE.Color(0x597cff))
        highlighter.add(`${TodoCreator.uuid}-priority-Alta`, new THREE.Color(0xff7676))
    }
    set world(world: OBC.World) {
        this._world = world
    }

    set enablePriorityHighlight(value: boolean) {
        const highlighter = this.components.get(OBCF.Highlighter)
        if (value) {
            for (const todo of this._list) {
                const fragments = this.components.get(OBC.FragmentsManager)
                const fragmentIdMap = fragments.guidToFragmentIdMap(todo.ifcGuids)
                highlighter.highlightByID(`${TodoCreator.uuid}-priority-${todo.priority}`, fragmentIdMap, false, false)
            } 
        } else {
            highlighter.clear()
        }
    }

    async addTodo(data: TodoInput) {
        const fragments = this.components.get(OBC.FragmentsManager)
        const highlighter = this.components.get(OBCF.Highlighter)
        const guids = fragments.fragmentIdMapToGuids(highlighter.selection.selectEvent) //IFCVIEWER
    
        const camera = this._world.camera
    
        if (!(camera instanceof OBC.OrthoPerspectiveCamera)) {
            throw new Error("No camera found in the world")
        }
        
        const position = new THREE.Vector3()
        camera.controls.getPosition(position)
        const target = new THREE.Vector3()
        camera.controls.getTarget(target)
    
        const todoData: TodoData = {
            name: data.name,
            task: data.task,
            priority: data.priority,
            ifcGuids: guids,
            camera: {
                position,
                target,
            }
        }
        this._list.push(todoData)
        this.onTodoCreated.trigger(todoData)
        }
        
    async highlightTodo(todo: TodoData) {
        const fragments = this.components.get(OBC.FragmentsManager)
        const fragmentIdMap = fragments.guidToFragmentIdMap(todo.ifcGuids)
        const highlighter = this.components.get(OBCF.Highlighter)
        highlighter.highlightByID("selectEvent", fragmentIdMap, true, false) //Idem que en IFCViewer
    
        if (!this._world) {
            throw new Error("No world found")
        }
    
        const camera = this._world.camera
        if (!(camera.hasCameraControls())) {
            throw new Error("The world camera doesn't have camera controls")
        }
    
        await camera.controls.setLookAt(
            todo.camera.position.x,
            todo.camera.position.y,
            todo.camera.position.z,
            todo.camera.target.x,
            todo.camera.target.y,
            todo.camera.target.z,
            true
        )
    }
    }