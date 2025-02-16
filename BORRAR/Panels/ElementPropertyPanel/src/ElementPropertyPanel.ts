import * as React from 'react';
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import { FragmentsGroup } from '@thatopen/fragments';
import { ViewerPanel } from "../../ViewerPanel";
import * as CUI from '@thatopen/ui-obc';
import * as BUI from "@thatopen/ui"
import * as FRAGS from "@thatopen/fragments";
import {ViewerToolbarComponent} from "./Template"


export class ViewerToolbar extends OBC.Component implements OBC.Disposable{
    static uuid = "99e5c829-dad3-43db-bb04-17b89e0b0d89"
    enabled = true
    private _world: OBC.World
    private _fragmentModel: FragmentsGroup | undefined
    private _floatingGrid : BUI.Grid | undefined
    private _viewerContainer: HTMLElement | undefined
    private _propsTable: any
    private _fragmentIdMap: FRAGS.FragmentIdMap = {}
    private _toolbar: any
    private _panel: any
    private _setShowProperties: (_prevShowProperties: boolean) => boolean;
    private _prevShowProperties: boolean

    onDisposed: OBC.Event<any> = new OBC.Event()

    visorActive = false;
    showProperties = false;
    classificationsTree: any;
    isComparing = false;
    mainWorld: OBC.World | undefined;
    compareWorld: OBC.World | undefined;
    viewportA: HTMLElement | undefined;
    viewportB: HTMLElement | undefined;
    showSecondWorld = false;
    uiInitialized = false;
    viewportHovered: "A" | "B" | null = null;
    clippingActive = false;
    currentPlane: OBCF.EdgesPlane | null = null;
    

    viewerPanelRef = React.createRef<ViewerPanel | null>();
    setupUIRef = React.createRef<(() => void) | null>();


    constructor(components: OBC.Components) {
        super(components)
        this.components.add(ViewerToolbar.uuid, this)

        this.classificationsTree = CUI.tables.classificationTree({
            components,
            classifications: []
        });

    }

    async dispose() {
        this.enabled=false
        this.onDisposed.trigger()
    }

    set world(world: OBC.World) {
        this._world = world
    }

    getPropsTable(){
        return this._propsTable
    }
    /*
    [toolbar, panel] = ViewerToolbarComponent({        
        components: this.components,
    });

    createToolbar(){
        const toolbar = ViewerToolbarComponent({        
            components: this.components,
        });
        return toolbar;
    }
    */
    createElements(){
        
        const [propsTable, updatePropsTable] = CUI.tables.elementProperties({
            components: this.components,
            fragmentIdMap: this._fragmentIdMap
        });

        this._propsTable = propsTable;

        const [toolbar, elementPropertyPanel] = ViewerToolbarComponent({        
            components: this.components,
        });

        if (!toolbar || !elementPropertyPanel) {
            console.error("Error al crear toolbar o panel");
            return; 
        }

        const highlighter = this.components.get(OBCF.Highlighter)

        highlighter.events.selectEvent.onHighlight.add((fragmentIdMap) => {
            if(!this._floatingGrid) return
            updatePropsTable({fragmentIdMap})
            propsTable.expanded = false

        })
        highlighter.events.selectEvent.onClear.add(() => {
            updatePropsTable({fragmentIdMap: {} })
            if(!this._floatingGrid) return
        })
        this.search = this.search.bind(this)
        return [toolbar, elementPropertyPanel]
    }

    search = (e: Event) => {
        const input = e.target as BUI.TextInput
        if (this._propsTable) {
            this._propsTable.queryString = input.value;
        }
    }

    onToggleProperties = () => {
        const floatingGrid = this._floatingGrid
        /*this._setShowProperties((this._prevShowProperties) => {
            const newShowProperties = !this._prevShowProperties;
            if (floatingGrid) {
                floatingGrid.layout = newShowProperties ? "secondary" : "main";
            }
            return newShowProperties;
        });
        */
        if (!floatingGrid) return
        if (floatingGrid.layout !== "secondary") {
            floatingGrid.layout = "secondary"
        } else {
            floatingGrid.layout = "main"
        }
    };

    onClassifier = () => {
        const floatingGrid = this._floatingGrid
        if (!floatingGrid) return
        if (floatingGrid.layout !== "classifier") {
            floatingGrid.layout = "classifier"
        } else {
            floatingGrid.layout = "main"
        }
    }

    processModel = async (model: FragmentsGroup) => {
        if (!model.hasProperties) return
        const indexer = this.components.get(OBC.IfcRelationsIndexer)
        await indexer.process(model)
    
        const classifier = this.components.get(OBC.Classifier)
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
            if (this.classificationsTree && this.classificationsTree.updateClassificationsTree) {
                this.classificationsTree.updateClassificationsTree({ classifications });
            }
    }
        
    onPopertyExport = async () => {
        if (!this._fragmentModel) return
        const exported = this._fragmentModel.getLocalProperties()
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
    onPropertyImport = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        const reader = new FileReader()
        reader.addEventListener("load", async () => {
            const json = reader.result
            if (!json) { return }
            const properties = JSON.parse(json as string)
            if (!this._fragmentModel) return
            this._fragmentModel.setLocalProperties(properties)
            await this.processModel(this._fragmentModel)
        })
        input.addEventListener('change', () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsText(filesList[0])
            })
        input.click()
    }

    onFragmentExport = () =>{
        const fragmentsManager = this.components.get(OBC.FragmentsManager)
        if (!this._fragmentModel) return
        const fragmentBinary = fragmentsManager.export(this._fragmentModel)
        const blob = new Blob([fragmentBinary])
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${this._fragmentModel.name}.frag`
        a.click()
        URL.revokeObjectURL(url)
    }
    onFragmentImport = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.frag'
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            const binary = reader.result
            if(!(binary instanceof ArrayBuffer)) return
            const fragmentBinary = new Uint8Array(binary)
            const fragmentsManager = this.components.get(OBC.FragmentsManager)
            fragmentsManager.load(fragmentBinary)
        })
        input.addEventListener('change', () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsArrayBuffer(filesList[0])
        })
        input.click()
    }

    onFragmentDispose = () => {
        const fragmentsManager = this.components.get(OBC.FragmentsManager)
        for (const [, group] of fragmentsManager.groups) {
            fragmentsManager.disposeGroup(group)
        }
        this._fragmentModel = undefined
    }

    onToggleVisibility = () => {
        const highlighter = this.components.get(OBCF.Highlighter)
        const fragments = this.components.get(OBC.FragmentsManager)
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
    onIsolate = () => {
        const highlighter = this.components.get(OBCF.Highlighter)
        const hider = this.components.get(OBC.Hider)
        const selection = highlighter.selection.selectEvent
        if(!selection){
            console.log("No hay selección")
            return
        }
        hider.isolate(selection)
    }
    onShow = () => {
        const hider = this.components.get(OBC.Hider)
        hider.set(true)
    }

    onVisor = () => {
        /*
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
        */
    };

    /*
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
    */

}