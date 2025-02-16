import * as React from 'react'
import * as OBC from '@thatopen/components'
import * as OBCF from '@thatopen/components-front'
import * as BUI from '@thatopen/ui'
import * as CUI from '@thatopen/ui-obc'
import * as THREE from 'three'
import {FragmentsGroup, IfcProperties} from '@thatopen/fragments'
import { createWorld } from "../components/functions/worlds-factory";

//TODOCREATOR
import { TodoCreator } from "../bim-components/TodoCreator";
import { ViewerPanel } from '../bim-components/ViewerPanel'

interface Props{
    components: OBC.Components
}
export function IFCViewer(props: Props){

    const components : OBC.Components = props.components
    const viewerPanelRef = React.useRef<ViewerPanel | null>(null);
    const [visorActive, setVisorActive] = React.useState(false)
    const [showProperties, setShowProperties] = React.useState(false)
    const [classificationsTree, updateClassificationsTree] = CUI.tables.classificationTree({
        components,
        classifications: []
    })
    const [isComparing, setIsComparing] = React.useState(false)
    

    let fragmentModel: FragmentsGroup | undefined
    components.init()

    const setViewer = () =>{

        const { world: worldA, viewport: viewportA }  = createWorld( components, {name: "Main"});
        console.log(viewportA)

        const ifcLoader = components.get(OBC.IfcLoader)
        ifcLoader.setup()
        
        const cullers = components.get(OBC.Cullers)
        const culler = cullers.list.get(worldA.uuid)
        console.log(culler)

        const fragmentsManager = components.get(OBC.FragmentsManager)
        fragmentsManager.onFragmentsLoaded.add(async(model) => {
            worldA.scene.three.add(model) 

            model.getLocalProperties()
            if (model.hasProperties){
                await processModel(model)
            }

            for (const fragment of model.items) {
                culler?.add(fragment.mesh)
            }
            if (culler) {culler.needsUpdate = true, console.log("Culler updated")}
            fragmentModel = model
        })
        
        const highlighter = components.get(OBCF.Highlighter)
        highlighter.setup({ 
            selectName: "selectEvent", // Cuidado que al cambiar esto ya no vale lo que explica JH.
            selectEnabled: true,
            hoverName: "hoverEvent",
            hoverEnabled: true,
            selectionColor: new THREE.Color(0xff0000),  
            hoverColor: new THREE.Color('#6B96CF'),     
            autoHighlightOnClick: true,
            world: worldA,
        })
        
        const resizeWorld = () => {
            worldA.renderer?.resize();
            worldA.camera.updateAspect();
        };
        
        highlighter.zoomToSelection=true

        worldA.camera.controls.addEventListener("controlend", () =>{
            if (culler) culler.needsUpdate = true
        })
        //TODOCREATOR
        const todoCreator = components.get(TodoCreator)
        todoCreator.world = worldA 
        todoCreator.setup()

        //VIEWERPANEL
        const viewerPanel = components.get(ViewerPanel);
        viewerPanel.world = worldA
        viewerPanelRef.current = viewerPanel
        
        return viewportA
        }
    
    const setupUI = () => {
        const viewerContainer = document.getElementById("Main") as HTMLElement
        console.log(viewerContainer)
        if(!viewerContainer) {
            console.log("No hay viewerContainer")
            return
        }

        const floatingGrid = BUI.Component.create<BUI.Grid>(() =>{
            return BUI.html`
            <bim-grid
                floating
                style="pading: 20px"
            >
            </bim-grid>
            `
        })

        const onToggleProperties = () => {
            setShowProperties((prevShowProperties) => {
                const newShowProperties = !prevShowProperties;
                if (floatingGrid) {
                    floatingGrid.layout = newShowProperties ? "secondary" : "main";
                }
                return newShowProperties;
            });
        };

        const elementPropertyPanel = BUI.Component.create<BUI.Panel>(()=>{
            const [propsTable, updatePropsTable] = CUI.tables.elementProperties({
                components,
                fragmentIdMap: {}
            })
            
            const highlighter = components.get(OBCF.Highlighter)

            highlighter.events.selectEvent.onHighlight.add(async (fragmentIdMap) => { // Quitar el async si no está el QTO
                if(!floatingGrid) return
                //floatingGrid.layout="secondary"
                updatePropsTable({fragmentIdMap})
                propsTable.expanded = false

            })
            highlighter.events.selectEvent.onClear.add(() => {
                updatePropsTable({fragmentIdMap: {} })
                if(!floatingGrid) return
                //floatingGrid.layout="main"
            })
        
            const search = (e: Event) => {
                const input = e.target as BUI.TextInput
                propsTable.queryString = input.value
            }

            return BUI.html`
            <bim-panel ${showProperties ? "" : "hidden"}>
                <bim-panel-section
                    name="Información"
                    label="Propiedades"
                    icon="solar:document-bold"
                    fixed
                >
                    <bim-text-input @input=${search} placeholder="Buscar..."></bim-text-input>
                    ${propsTable}
                </bim-panel-section>
            </bim-panel>
            `
        })

        const onClassifier = () => {
            if (!floatingGrid) return
            if (floatingGrid.layout !== "classifier") {
                floatingGrid.layout = "classifier"
            } else {
                floatingGrid.layout = "main"
            }
        }
        
        const classifierPanel = BUI.Component.create<BUI.Panel>(() => {
        return BUI.html`
            <bim-panel>
            <bim-panel-section 
                name="classifier" 
                label="Classifier" 
                icon="solar:document-bold" 
                fixed
            >
                <bim-label>Classifications</bim-label>
                ${classificationsTree}
            </bim-panel-section>
            </bim-panel>
        `;
        })

        const onWorldsUpdate = () => {
            if (!floatingGrid) return
            floatingGrid.layout = "world"
        }
        const worldPanel = BUI.Component.create<BUI.Panel>(() => {
            const [worldsTable] = CUI.tables.worldsConfiguration({ components })
            
            const search = (e: Event) => {
                const input = e.target as BUI.TextInput
                worldsTable.queryString = input.value
            }
            
            return BUI.html `
                <bim-panel>
                <bim-panel-section
                    name="world"
                    label="Worlds"
                    icon="tabler:brush"
                    fixed
                >
                    <bim-text-input @input=${search} placeholder="Buscar..."></bim-text-input>
                    ${worldsTable}  
                </bim-panel-section>
                </bim-panel>
            `;
        })

        const toolbar = BUI.Component.create<BUI.Toolbar>(() =>{
            const [loadIfcBtn] = CUI.buttons.loadIfc({ components: components })
            loadIfcBtn.tooltipTitle = "Cargar IFC"
            loadIfcBtn.label = ""
            return BUI.html`
                <bim-toolbar style="justify-self: center; margin-bottom: 20px">
                    <bim-toolbar-section label="App">
                        <bim-button 
                        tooltip-title="World" 
                        icon="tabler:brush" 
                        @click=${onWorldsUpdate}
                        ></bim-button>
                    </bim-toolbar-section>
                    <bim-toolbar-section label="IFC">
                        ${loadIfcBtn}
                        <bim-button 
                            tooltip-title=${isComparing ? "Salir de comparación" : "Comparar modelos"}
                            icon=${isComparing ? "ph:arrows-out" : "pajamas:comparison"}
                            @click=${() => setIsComparing(!isComparing)}
                        ></bim-button>
                    </bim-toolbar-section>
                    <bim-toolbar-section label="Procesado 3D">
                        <bim-button 
                            tooltip-title="Importar"
                            icon="mdi:cube"
                            @click=${onFragmentImport}
                        ></bim-button>
                        <bim-button
                            tooltip-title="Exportar"
                            icon="tabler:package-export"
                            @click=${onFragmentExport}
                        ></bim-button>
                        <bim-button
                            tooltip-title="Borrar"
                            icon="tabler:trash"
                            @click=${onFragmentDispose}
                        ></bim-button>
                    </bim-toolbar-section>
                    <bim-toolbar-section label="Seleccionar">
                        <bim-button 
                            tooltip-title="Visibilidad"
                            icon="material-symbols:visibility-outline"
                            @click=${onToggleVisibility}
                        ></bim-button>
                        <bim-button 
                            tooltip-title="Aislar"
                            icon="mdi:filter"
                            @click=${onIsolate}
                        ></bim-button>
                        <bim-button 
                            tooltip-title="Mostrar Todo"
                            icon="tabler:eye-filled"
                            @click=${onShow}
                        ></bim-button>
                    </bim-toolbar-section>
                    <bim-toolbar-section label="Propiedades">
                        <bim-button 
                            tooltip-title="Mostrar"
                            icon="clarity:list-line"
                            @click=${onToggleProperties}
                        ></bim-button>
                        <bim-button
                            tooltip-title="Importar"
                            icon="clarity:import-line"
                            @click=${onPropertyImport}
                        ></bim-button>
                        <bim-button
                            tooltip-title="Exportar"
                            icon="clarity:export-line"
                            @click=${onPopertyExport}
                        ></bim-button>
                    </bim-toolbar-section>
                    <bim-toolbar-section label="Grupos">
                    <bim-button 
                        tooltip-title="Mostrar"
                        icon="tabler:eye-filled"
                        @click=${onClassifier}
                    ></bim-button>
                    <bim-button 
                        tooltip-title="Panel en el Visor"
                        icon="pajamas:comment-dots"
                        @click=${()=>{
                            onVisor()
                        }}
                    ></bim-button>
                </bim-toolbar-section>
                </bim-toolbar>
            `
        })

        floatingGrid.layouts = {
            main: {
                template: `
                    "empty" 1fr
                    "toolbar" auto
                    / 1fr
                `,
                elements: {
                    toolbar
                }
            },
            secondary: {
                template: `
                    "empty elementPropertyPanel" 1fr
                    "toolbar toolbar" auto
                    / 1fr 20rem
                `,
                elements: {
                    toolbar,
                    elementPropertyPanel
                }
            },
            world: {
                template: `
                    "empty worldPanel" 1fr
                    "toolbar toolbar" auto
                    / 1fr 20rem
                `,
                elements: {
                    toolbar,
                    worldPanel
                }
            },
            classifier: {
                template: `
                    "empty classifierPanel" 1fr
                    "toolbar toolbar" auto
                    /1fr 20rem
                `,
                elements: { 
                    toolbar,
                    classifierPanel
                },
            }
        }
        floatingGrid.layout = "main"
        viewerContainer.appendChild(floatingGrid)
    }

    // Funcionalidades del Toolbar:
    const processModel = async (model: FragmentsGroup) => {
        if (!model.hasProperties) return
        const indexer = components.get(OBC.IfcRelationsIndexer)
        await indexer.process(model)
    
        const classifier = components.get(OBC.Classifier)
        await classifier.bySpatialStructure(model)
        classifier.byEntity(model)
    
        const classifications = [
            {
                system: "entities", label: "Entities"
            },
            {
                system: "spatialStructures", label: "Spatial Containers"
            }
            ]
            if (updateClassificationsTree) {
            updateClassificationsTree({classifications})
        }
    }
        
    const onPopertyExport = async () => {
        if (!fragmentModel) return
        const exported = fragmentModel.getLocalProperties()
        const serialized = JSON.stringify(exported);
        const file = new File([new Blob([serialized])], "properties.json");
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.download = "properties.json";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
    }
    const onPropertyImport = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        const reader = new FileReader()
        reader.addEventListener("load", async () => {
            const json = reader.result
            if (!json) { return }
            const properties = JSON.parse(json as string)
            if (!fragmentModel) return
            fragmentModel.setLocalProperties(properties)
            await processModel(fragmentModel)
        })
        input.addEventListener('change', () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsText(filesList[0])
            })
        input.click()
    }

    const onFragmentExport = () =>{
        const fragmentsManager = components.get(OBC.FragmentsManager)
        if (!fragmentModel) return
        const fragmentBinary = fragmentsManager.export(fragmentModel)
        const blob = new Blob([fragmentBinary])
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fragmentModel.name}.frag`
        a.click()
        URL.revokeObjectURL(url)
    }
    const onFragmentImport = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.frag'
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            const binary = reader.result
            if(!(binary instanceof ArrayBuffer)) return
            const fragmentBinary = new Uint8Array(binary)
            const fragmentsManager = components.get(OBC.FragmentsManager)
            fragmentsManager.load(fragmentBinary)
        })
        input.addEventListener('change', () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsArrayBuffer(filesList[0])
        })
        input.click()
    }

    const onFragmentDispose = () => {
        const fragmentsManager = components.get(OBC.FragmentsManager)
        for (const [, group] of fragmentsManager.groups) {
            fragmentsManager.disposeGroup(group)
        }
        fragmentModel = undefined
    }

    const onToggleVisibility = () => {
        const highlighter = components.get(OBCF.Highlighter)
        const fragments = components.get(OBC.FragmentsManager)
        const selection = highlighter.selection.selectEvent // It must be the same than "selectName" in the setup.
        if (!selection) {
            console.log("La selección no está definida")
            return
        }
        if(Object.keys(selection).length === 0) return
        for (const fragmentID in selection){
            const fragment = fragments.list.get(fragmentID)
            const expressIDs = selection[fragmentID]
            for (const id of expressIDs){
                if (!fragment) continue
                const isHidden = fragment.hiddenItems.has(id)
                if (isHidden){
                    fragment.setVisibility(true,[id])
                } else {
                    fragment.setVisibility(false,[id])
                }
            }
        }
    }
    const onIsolate = () => {
        const highlighter = components.get(OBCF.Highlighter)
        const hider = components.get(OBC.Hider)
        const selection = highlighter.selection.selectEvent
        if(!selection){
            console.log("No hay selección")
            return
        }
        hider.isolate(selection)
    }
    const onShow = () => {
        const hider = components.get(OBC.Hider)
        hider.set(true)
    }

    const onVisor = () => {
        setVisorActive((prevState) => {
            const newState = !prevState;
            console.log(newState ? "Activando panel..." : "Desactivando panel...");
    
            if (viewerPanelRef.current) {
                if (newState) {
                    viewerPanelRef.current.addTable();
                } else {
                    viewerPanelRef.current.removeTable();
                    viewerPanelRef.current.stopAddingTables();
                }
            }
    
            return newState;
        });
    };
    
    React.useEffect(() => {
        console.log("status: ", visorActive);
    }, [visorActive]);

    
    // Para que funcione el visor:
    
    React.useEffect(() => {
        const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement;
        if (viewerContainer) {
            const viewportA = setViewer()

            viewerContainer.innerHTML = "";
            
            console.log("viewportA insertado en:", viewerContainer);
            
            if (viewportA instanceof Node) {
                viewerContainer.appendChild(viewportA);
                const canvas = viewportA.querySelector("canvas") as HTMLCanvasElement;
                if (canvas) {
                    const padding = 5;
                    const newWidth = viewerContainer.clientWidth - 2 * padding;
                    const newHeight = viewerContainer.clientHeight - 2 * padding;
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    canvas.style.width = `${newWidth}px`;
                    canvas.style.height = `${newHeight}px`;
                    canvas.id = "viewer-canvas"
    
                    console.log("Nuevo tamaño del canvas:", canvas.width, canvas.height);
                }
            } else {
                console.error("viewportA no es un nodo válido");
            }
        }
        setTimeout(() => {
            setupUI()
        })
        return () =>{

            const highlighter = components.get(OBCF.Highlighter)
            if (highlighter && typeof highlighter.dispose === "function") {
            highlighter.dispose()
            }
            if(components){
                components.dispose()
            }
            if (fragmentModel){
                fragmentModel.dispose()
                fragmentModel = undefined
            }
            const viewer = document.getElementById("viewer-container");
            if (viewer) {
                viewer.innerHTML = ""
            }
        }
    },[]);
    

    return(
        <div id="viewer-container" className="dashboard-card" style={{ minWidth: 0 , maxWidth: 800}}></div>

    )
}
    
    