import * as OBC from "@thatopen/components"
import * as OBCF from "@thatopen/components-front"
import * as BUI from "@thatopen/ui"
import * as THREE from "three"
import { TodoData, TodoInput } from "./base-types"
import { UUID } from "@thatopen/components"

export class TodoCreator extends OBC.Component implements OBC.Disposable{
    static uuid = "fe04ded6-f563-472b-8d4c-467c308320cd"
    enabled = true
    private _world: OBC.World
    private _list: TodoData[] = []
    private _markers: {[id: string]: OBCF.Mark} = {}

    onTodoCreated = new OBC.Event<TodoData>()
    onDisposed: OBC.Event<any> = new OBC.Event()
    onTodoDeleted = new OBC.Event<string>();

    constructor(components: OBC.Components) {
        super(components)
        this.components.add(TodoCreator.uuid, this)
    }

    async dispose() {
        this.enabled=false
        this._list = []
        this.onDisposed.trigger()
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
        if (!this.enabled) return
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
            },
            id: UUID.create(),
        }
        this._list.push(todoData)
        this.onTodoCreated.trigger(todoData)
        }
    
    async highlightTodo(todo: TodoData) {
        if (!this.enabled) return
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

    deleteTodo(id: string) {
        if (!this.enabled) return
            
        const todoExists = this._list.some((t) => t.id === id);
        if (!todoExists) {
        console.warn(`No se ha encontrado el todo con el id proporcionado: ${id}`)
        return
        }
    
        this._list = this._list.filter((t) => t.id !== id);
        this.onTodoDeleted.trigger(id);
    }
    
    addTodoMaker(todoId: string, singleMarker: boolean = true) {
        if (!this.enabled) return

        const todo = this._list.find((t) => t.id === todoId)
        if (!todo) return

        if (todo.ifcGuids.length === 0) return

        if (singleMarker && this._markers[todoId]) {
            this._markers[todoId].dispose()
            delete this._markers[todoId]
            return
        } else if (this._markers[todoId]) {
            return
        }

        const fragments = this.components.get(OBC.FragmentsManager)
        const fragmentIdMap = fragments.guidToFragmentIdMap(todo.ifcGuids)
        const boundingBoxer = this.components.get(OBC.BoundingBoxer)
        boundingBoxer.addFragmentIdMap(fragmentIdMap)
        const { center } = boundingBoxer.getSphere()
        boundingBoxer.reset()

        const label = BUI.Component.create<BUI.Label>(() => {
            return BUI.html `
                <bim-label
                    @mouseover=${() => {
                        const highlighter = this.components.get(OBCF.Highlighter)
                        highlighter.highlightByID("hoverEvent", fragmentIdMap, true, false) // Como en el IFCViewer
                    }}
                    style="background-color: var(--bim-ui_bg-contrast-100); cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 999px; pointer-events: auto;"
                    icon="fa:map-marker"
                ></bim-label>
            `
        })
        const marker = new OBCF.Mark(this._world, label)
        marker.three.position.copy(center)
        this._markers[todo.id] = marker
        
    }  
    set enableMarkers(value: boolean) {
        if (!this.enabled) return
        
        if (value) {

            for (const todo of this._list) {
                this.addTodoMaker(todo.id, false)
            }
            
        } else {
            for (const [id, mark] of Object.entries(this._markers)) {
                mark.dispose()
                delete this._markers[id]
            }
            
        }
    }    
}