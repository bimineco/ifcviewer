import * as React from 'react'
import * as OBC from '@thatopen/components'
import * as OBCF from '@thatopen/components-front'
import * as BUI from '@thatopen/ui'
import * as CUI from '@thatopen/ui-obc'
import * as THREE from 'three'
import {FragmentsGroup} from '@thatopen/fragments'
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
    const [mainWorld, setMainWorld] = React.useState<OBC.World>();
    const [compareWorld, setCompareWorld] = React.useState<OBC.World>();
    const [viewportA, setViewportA] = React.useState<HTMLElement>();
    const [viewportB, setViewportB] = React.useState<HTMLElement>();
    const [showSecondWorld, setShowSecondWorld] = React.useState(false);
    const setupUIRef = React.useRef<(() => void) | null>(null);
    const [uiInitialized, setUIInitialized] = React.useState(false);
    const [viewportHovered, setViewportHovered] = React.useState<"A" | "B" | null>(null);
    const [clippingActive, setClippingActive] = React.useState(false);
    const [currentPlane, setCurrentPlane] = React.useState<OBCF.EdgesPlane | null>(null);

    let fragmentModel: FragmentsGroup | undefined
    let viewportAHovered = false;
    let viewportBHovered = false;

    React.useEffect(() => {
        components.init();
        
        const { world: worldA, viewport: viewportA } = createWorld(components, { name: "Main" });
        setMainWorld(worldA);
        setViewportA(viewportA);
        
        const setupWorld = (world: OBC.World) => {
            const ifcLoader = components.get(OBC.IfcLoader);
            ifcLoader.setup();
            
            const fragmentsManager = components.get(OBC.FragmentsManager);
            
            fragmentsManager.onFragmentsLoaded.add(async (model) => {
                world.scene.three.add(model);
                if (model.hasProperties) await processModel(model);
                
                const cullers = components.get(OBC.Cullers);
                const culler = cullers.list.get(world.uuid);
                model.items.forEach(fragment => culler?.add(fragment.mesh));
                culler && (culler.needsUpdate = true);
                
                fragmentModel = model;
            });
            
            // Configurar highlighter
            const highlighter = components.get(OBCF.Highlighter);
            highlighter.setup({
                selectName: "selectEvent",
                selectEnabled: true,
                hoverName: "hoverEvent",
                hoverEnabled: true,
                selectionColor: new THREE.Color(0xff0000),
                hoverColor: new THREE.Color('#6B96CF'),
                autoHighlightOnClick: true,
                world,
            });
            
            // Configurar TodoCreator
            const todoCreator = components.get(TodoCreator);
            todoCreator.world = world;
            todoCreator.setup();
            
            const viewerPanel = components.get(ViewerPanel);
            viewerPanel.world = worldA
            viewerPanelRef.current = viewerPanel


            return { fragmentsManager, highlighter };
        };

        setupWorld(worldA);
        
    
        return () => {
            components.dispose();
            fragmentModel?.dispose();
        };
    }, []);

    const initializeUI = React.useCallback(() => {
        const viewerContainer = document.getElementById("viewer-container");
        if (!viewerContainer || uiInitialized) return;
        //console.log(viewerContainer)
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
            const handleCompare = () => {
                setIsComparing(prev => !prev);
                setShowSecondWorld(prev => !prev);
            };
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
                            @click=${handleCompare}
                        ></bim-button>
                    </bim-toolbar-section>
                    <bim-toolbar-section label="Seleccionar">
                        <bim-button 
                        tooltip-title="Activar Sección"
                        icon="pajamas:snippet"
                        @click=${()=>{ 
                            toggleClippingPlanes(!clippingActive)
                        }}
                        ></bim-button>
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
                        <bim-button 
                        tooltip-title="Panel en el Visor"
                        icon="pajamas:comment-dots"
                        @click=${()=>{
                            onVisor()
                        }}
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
        viewerContainer.appendChild(floatingGrid);
        setUIInitialized(true);
    }, [components, uiInitialized, showProperties, isComparing]);

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
        //console.log("status: ", visorActive);
    }, [visorActive]);

    React.useEffect(() => {
        if (mainWorld && !uiInitialized) {
            initializeUI();
            setupUIRef.current = initializeUI;
        }
    }, [mainWorld, uiInitialized, initializeUI]);

    React.useEffect(() => {
        if (setupUIRef.current) {
            setupUIRef.current();
        }
    }, [showProperties, isComparing])

    console.log("Estado actual:", {
        mainWorld: !!mainWorld,
        compareWorld: !!compareWorld,
        viewportA: !!viewportA,
        viewportB: !!viewportB,
        showSecondWorld
    });





    // Efecto para segundo mundo
    React.useEffect(() => {
        if (!showSecondWorld || !components) return;
        
        const { world: worldB, viewport: viewportB } = createWorld(components, { name: "Compare" });
        setCompareWorld(worldB);
        setViewportB(viewportB);
        
        return () => {
            worldB.dispose();
            components.get(OBC.Cullers).list.delete(worldB.uuid);
        };
    }, [showSecondWorld]);

    // Sincronización de cámaras
    /*
    React.useEffect(() => {
        if (!mainWorld || !compareWorld || !showSecondWorld) return;
    
        const syncCameras = (source: OBC.World, target: OBC.World) => {
            const position = new THREE.Vector3();
            const targetVector = new THREE.Vector3();
            source.camera.controls.getPosition(position);
            source.camera.controls.getTarget(targetVector);
            target.camera.controls.setLookAt(
                position.x,
                position.y,
                position.z,
                target.x,
                target.y,
                target.z,
                true
            );
            target.renderer?.resize();
            target.camera.updateAspect();
        };
    
        const debouncedSync = debounce(() => {
            if (viewportHovered === "A") syncCameras(mainWorld, compareWorld);
            if (viewportHovered === "B") syncCameras(compareWorld, mainWorld);
        }, 50);
    
        const events = ["control", "controlstart", "controlend"];
        
        const addListeners = (world: OBC.World) => {
            events.forEach(event => {
                world.camera.controls.addEventListener(event, debouncedSync);
            });
        };
    
        addListeners(mainWorld);
        addListeners(compareWorld);
    
        return () => {
            events.forEach(event => {
                mainWorld.camera.controls.removeEventListener(event, debouncedSync);
                compareWorld.camera.controls.removeEventListener(event, debouncedSync);
            });
        };
    }, [mainWorld, compareWorld, showSecondWorld, viewportHovered]);
    */
    
    
    React.useEffect(() => {
        if (!mainWorld || !compareWorld || !showSecondWorld) return;
        
        const syncCameras = (source, target) => {
            if (!source.camera?.controls || !target.camera?.controls) return;
    
            const position = new THREE.Vector3();
            const targetPos = new THREE.Vector3();
            source.camera.controls.getPosition(position);
            source.camera.controls.getTarget(targetPos);
    
            target.camera.controls.setLookAt(
                position.x, position.y, position.z,
                targetPos.x, targetPos.y, targetPos.z,
                false 
            );
        };
        
        const onMainControl = () => syncCameras(mainWorld, compareWorld);
        const onCompareControl = () => syncCameras(compareWorld, mainWorld);

        mainWorld.camera.controls?.addEventListener("control", onMainControl);
        compareWorld.camera.controls?.addEventListener("control", onCompareControl);
        
        if (mainWorld.renderer && compareWorld.renderer) {
            const planeMain = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
            const planeCompare = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); 
            const applyClippingPlanes = (world, plane) => {
                if (!world?.scene?.children) {return console.log(world.scene)}
        
                world.scene.children.forEach((obj) => {
                    if (obj.isMesh && obj.material) {
                        obj.material.clippingPlanes = [plane];
                        obj.material.clipIntersection = false;
                        obj.material.needsUpdate = true;
                    }
                });
            };
            console.log(mainWorld.scene)
            applyClippingPlanes(mainWorld.scene, planeMain);
            applyClippingPlanes(compareWorld.scene, planeCompare);
            
        }else{
            console.log("No clipping")
        }
        return () => {
            mainWorld.camera.controls?.removeEventListener("control", onMainControl);
            compareWorld.camera.controls?.removeEventListener("control", onCompareControl);

            const removeClippingPlanes = (scene) => {
                if (!scene || !scene.children) return;
    
                scene.children.forEach((obj) => {
                    if (obj.isMesh && obj.material) {
                        obj.material.clippingPlanes = [];
                        obj.material.needsUpdate = true;
                    }
                });
            };
    
            removeClippingPlanes(mainWorld.scene);
            removeClippingPlanes(compareWorld.scene);
        };
    }, [mainWorld, compareWorld, showSecondWorld]);

    // Renderizado de viewports
    React.useEffect(() => {
        const container = document.getElementById("viewer-container");
        if (!container || !viewportA) return;
        
        container.innerHTML = "";
        container.appendChild(viewportA);
        
        if (showSecondWorld && viewportB) {
            viewportB.style.clipPath = "inset(0 50% 0 0)";
            container.appendChild(viewportB);
            createSplitter(container, viewportA, viewportB);
        }
    }, [viewportA, viewportB, showSecondWorld]);
    
    const createSplitter = (container: HTMLElement, viewportA: HTMLElement, viewportB: HTMLElement) => {
        const slider = document.createElement("div");
        slider.style.cssText = `
            position: absolute;
            top: 0;
            left: 50%;
            width: 5px;
            height: 100%;
            background-color: black;
            cursor: ew-resize;
            z-index: 100;
        `;
        
        const drag = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const widthPercentage = Math.max(10, Math.min(90, (x / rect.width) * 100));
            slider.style.left = `${widthPercentage}%`;
            viewportB.style.clipPath = `inset(0 ${100 - widthPercentage}% 0 0)`;
        };
        
        slider.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", drag);
            document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", drag);
            });
        });
        
        container.appendChild(slider);
    };
    
    
    const [clippingPlanesActive, setClippingPlanesActive] = React.useState(false);
    const clipperButtonRef = React.useRef(null);
    const section = React.useRef(null);

    

    const toggleClippingPlanes = (state) => {
        const newState = !clippingPlanesActive;
        setClippingPlanesActive(newState);
        /*// Invertir el estado de clipping
        
        

        // Crear un nuevo plano de corte (puedes personalizar esto)
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1);
        const viewer = components.get(OBC.Viewer);
        // Verificar si el `viewer` y `Sections` están disponibles
        if (viewer && viewer.sections) {
            // Si está activo, activamos el clipping
            if (newState) {
                viewer.sections.addPlane(plane);
            } else {
                viewer.sections.removePlane(plane);
            }
        }

        */
        console.log(`Clipping planes ${newState ? "activados" : "desactivados"}`);
    };
    
        React.useEffect(() => {
            if (clippingActive) {
                console.log("Clipping plane activado");
            } else {
                console.log("Clipping plane desactivado");
            }
        }, [clippingPlanesActive]);
    
    /*
    const toggleClippingPlanes = async (isActive: boolean) => {
        if (!mainWorld) return;
        const highlighter = components.get(OBCF.Highlighter);
        const fragments = components.get(OBC.FragmentsManager);
        
        if (isActive) {
          // Obtener la selección actual
            const selection = highlighter.selection.selectEvent;
            
            if (!selection || Object.keys(selection).length === 0) {
                console.warn("¡Selecciona un elemento primero!");
                return;
            }
        
            // Obtener el fragmento seleccionado
            const fragmentID = Object.keys(selection)[0];
            const fragment = fragments.list.get(fragmentID);
            
            if (!fragment) {
                console.error("Fragmento no encontrado");
                return;
            }
        
            // Calcular la bounding box de la selección
            const bbox = new THREE.Box3();
            const expressIDs = selection[fragmentID];
            
            fragment.mesh.geometry.boundsTree.getBoundingBox(expressIDs, bbox);
            const center = bbox.getCenter(new THREE.Vector3());
            
            // Crear plano de corte orientado
            const normal = new THREE.Vector3(0, 0, 1); // Plano horizontal por defecto
            const plane = new OBCF.EdgesPlane(mainWorld, normal, center);
            plane.visible = true;
            
            // Configurar materiales
            const materials = fragments.materials;
            plane.edges.setPattern(materials, 0.1);
            
            // Aplicar el plano
            mainWorld.scene.three.add(plane.three);
            materials.setClippingPlanes([plane.three]);
        
            setCurrentPlane(plane);
            console.log("Plano de corte activado");
            } else {
            // Eliminar plano existente
            if (currentPlane) {
                mainWorld.scene.three.remove(currentPlane.three);
                currentPlane.dispose();
                setCurrentPlane(null);
            }
            
            // Restablecer materiales
            const materials = fragments.materials;
            materials.setClippingPlanes([]);
            console.log("Plano de corte desactivado");
            }
        
            setClippingActive(isActive);
        };
    */

    return(
        <div id="viewer-container" 
            className="dashboard-card" 
            style={{ 
                position: 'relative',
                width: '100%',
                height: '95vh',
                minWidth: 0, 
                maxWidth: 800
            }}>
        </div>
    )
}
    
    