import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as CUI from '@thatopen/ui-obc';
import * as THREE from "three";
import { AppManager } from "../../bim-components";
import ProcessModel from '../general/ProcessModel';

export default (components: OBC.Components) => {

  const appManager = components.get(AppManager);
  const floatingGrid = appManager.floatingGrid //appManager.grids.get("floatingGrid")
  let fragmentModel = appManager.fragmentModel
  const viewerPanelRef = appManager.viewerPanelRef
  
  const onPropertyExport = async () => {
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
      await ProcessModel(fragmentModel, components)
    })
    input.addEventListener('change', () => {
    const filesList = input.files
    if (!filesList) { return }
      reader.readAsText(filesList[0])
    })
    input.click()
  }

  const onFragmentExport = () =>{
    console.log(fragmentModel)
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
    appManager.updateVisorActive(!appManager.state.visorActive)
    console.log(appManager.state.visorActive ? "Activando panel..." : "Desactivando panel...");
    //console.log(viewerPanelRef)
    if (viewerPanelRef) {
      if (appManager.state.visorActive) {
        viewerPanelRef.addTable();
      } else {
        viewerPanelRef.removeTable();
        viewerPanelRef.stopAddingTables();
      }
    }
  };

  const onToggleProperties = () => {
    appManager.updatePropertiesActive(!appManager.state.propertiesActive)
    console.log(appManager.state.propertiesActive ? "Activando panel..." : "Desactivando panel...");
    if (floatingGrid) {
      const bool = appManager.state.propertiesActive
      if (bool) {
        floatingGrid.layout = bool ? "secondary" : "main";
      } else {
        floatingGrid.layout = "main";
      }  
    }
  }
  const onWorldsUpdate = () => {
    if (!floatingGrid) return
    if (floatingGrid.layout !== "world") {
      floatingGrid.layout = "world"
    } else {
      floatingGrid.layout = "main"
    }
  }

  
  const onTreePanel = () => {
    if (!floatingGrid) return
    if (floatingGrid.layout !== "tree") {
      floatingGrid.layout = "tree"
      if (!fragmentModel) return
      //ProcessModel(fragmentModel, components)
    } else {
      floatingGrid.layout = "main"
    }
  }

  const onSection = () => {
    const casters = components.get(OBC.Raycasters)
    const world = appManager.worldA
    if (!world) return
    casters.get(world)
  
    const clipper = components.get(OBC.Clipper)
    clipper.enabled = true
    clipper.visible = true
  
    const container = document.getElementById("viewer-container")
    if (!container) return

    world.scene.three.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log('Mesh encontrado en:', child);
      }
    });
  
    container.ondblclick = (event) => {
      console.log("Doble click detectado");
      
      /*const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
      const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.set(0, 1.5, 0);
      world.scene.three.add(cube);
      world.meshes.add(cube);
      */
      console.log(world.meshes)
  
      if (clipper.enabled) {
        const plano = clipper.create(world);
        console.log("Clipper habilitado:", clipper.enabled);
        console.log("Plano creado:", plano);
      }
    };
  
    window.onkeydown = (event) => {
      if (event.code === "Delete" || event.code === "Backspace") {
        if (clipper.enabled) {
          clipper.delete(world);
        }
      }
    };
  
    components.init();
  };

  const handleCompare = () => {
    appManager.updateComparingActive(!appManager.state.isComparing)
    console.log(appManager.state.isComparing)
  }

  return BUI.Component.create<BUI.Toolbar>(() => {
    console.log("ViewerToolbar")
    const [loadIfcBtn] = CUI.buttons.loadIfc({ components: components })
    loadIfcBtn.tooltipTitle = "Cargar IFC"
    loadIfcBtn.label = ""
    return BUI.html`
      <bim-toolbar style="justify-self: center; margin-bottom: 20px; height: 75px">
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
            tooltip-title=${appManager.state.isComparing ? "Salir de comparación" : "Comparar modelos"}
            icon=${appManager.state.isComparing ? "ph:arrows-out" : "pajamas:comparison"}
            @click=${handleCompare}
          ></bim-button>
        </bim-toolbar-section>
        <bim-toolbar-section label="Seleccionar">
          <bim-button 
            tooltip-title="Activar Sección"
            icon="pajamas:snippet"
            @click=${()=>{ 
              onSection()
              console.log("pulsandoboton")
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
            @click=${()=>{
              onToggleProperties()}
            }
          ></bim-button>
          <bim-button
            tooltip-title="Importar"
            icon="clarity:import-line"
            @click=${onPropertyImport}
          ></bim-button>
          <bim-button
            tooltip-title="Exportar"
            icon="clarity:export-line"
            @click=${onPropertyExport}
          ></bim-button>
        </bim-toolbar-section>
        <bim-toolbar-section label="Árbol">
          <bim-button 
            tooltip-title="Mostrar el árbol del IFC"
            icon="tabler:eye-filled"
            @click=${
              onTreePanel
              }
          ></bim-button>
        </bim-toolbar-section>
      </bim-toolbar>
    `;
  });
}