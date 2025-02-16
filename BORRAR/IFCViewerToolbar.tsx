import * as React from 'react'
import * as OBC from '@thatopen/components'
import * as OBCF from '@thatopen/components-front'
import * as BUI from '@thatopen/ui'
import * as CUI from '@thatopen/ui-obc'
import * as THREE from 'three'
import {FragmentsGroup} from '@thatopen/fragments'
import { createWorld } from "../src/components/functions/worlds-factory";

//TODOCREATOR
import { TodoCreator } from "../src/bim-components/TodoCreator";
import { ViewerPanel } from '../src/bim-components/ViewerPanel'
//Limpieza 

import { AppManager } from '../src/bim-components'
import ElementPropertyPanel from './Panels/ElementPropertyPanel';
import ViewerToolbar from './Toolbars/ViewerToolbar';
import ProcessModel from '../src/components/general/ProcessModel'
import WordPanel from './Panels/WorldPanel'
import TreePanel from './Panels/TreePanel'

interface Props{
    components: OBC.Components
}
export function IFCViewerToolbar(props: Props){

  const components : OBC.Components = props.components
  const viewerPanelRef = React.useRef<ViewerPanel | null>(null);

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

  const getFragmentModel = () =>{
    return fragmentModel
  }
  const appManager = components.get(AppManager);

  React.useEffect(() => {
    console.count("useEffect ejecutado");
    if (uiInitialized) {
      console.log("useEffect no ejecutado");
      return 
    }
    components.init();

    const { world: worldA, viewport: viewportA } = createWorld(components, { name: "Main" });
    setMainWorld(worldA);
    setViewportA(viewportA);
    appManager.worldA = worldA;

    const setupWorld = (world: OBC.World) => {
      const ifcLoader = components.get(OBC.IfcLoader);
      ifcLoader.setup();
      
      const fragmentsManager = components.get(OBC.FragmentsManager);
      
      fragmentsManager.onFragmentsLoaded.add(async (model) => {
        world.scene.three.add(model);
        if (model.hasProperties) await ProcessModel(model, components);
        
        const cullers = components.get(OBC.Cullers);
        const culler = cullers.list.get(world.uuid);
        model.items.forEach(fragment => culler?.add(fragment.mesh));
        culler && (culler.needsUpdate = true);
        
        appManager.fragmentModel = model;
        fragmentModel = model;
      });


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
      

      const todoCreator = components.get(TodoCreator);
      todoCreator.world = world;
      todoCreator.setup();
      
      const viewerPanel = components.get(ViewerPanel);
      viewerPanel.world = worldA
      viewerPanelRef.current = viewerPanel
      appManager.viewerPanelRef = viewerPanel;

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

    if(!viewerContainer) {
      console.log("No hay viewerContainer")
      return
    }

    const floatingGrid = BUI.Component.create<BUI.Grid>(() =>{
      return BUI.html`
      <bim-grid
          floating
          style= "pading: 20px"
          id = "floatingGrid"
      >
      </bim-grid>
      `
    })

    appManager.floatingGrid = floatingGrid;

    const elementPropertyPanel = ElementPropertyPanel(components)
    const toolbar = ViewerToolbar(components)
    const worldPanel = WordPanel(components)
    const treePanel = TreePanel(components)

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
      tree: {
        template: `
          "empty treePanel" 1fr
          "toolbar toolbar" auto
          /1fr 20rem
      `,
        elements: { 
          toolbar,
          treePanel
          },
        }
      }
      
      floatingGrid.layout = "main"

      setTimeout(() => {
        viewerContainer.appendChild(floatingGrid);
      }, 100);

      setUIInitialized(true);

  }, [components, uiInitialized]);

  React.useEffect(() => {
    if (mainWorld && !uiInitialized) {
      initializeUI();
      console.log(mainWorld.meshes)
      setupUIRef.current = initializeUI;
    }
    const container = document.getElementById("viewer-container");
    if (!container || !viewportA) return;
  
    container.innerHTML = "";
    container.appendChild(viewportA);
  
    if (showSecondWorld && viewportB) {
      viewportB.style.clipPath = "inset(0 50% 0 0)";
      container.appendChild(viewportB);
      createSplitter(container, viewportA, viewportB);
    }
  }, [mainWorld, uiInitialized, initializeUI, viewportA, viewportB, showSecondWorld]);

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

      */
      //console.log(`Clipping planes ${newState ? "activados" : "desactivados"}`);
  };
  /*
      React.useEffect(() => {
          if (clippingActive) {
              console.log("Clipping plane activado");
          } else {
              console.log("Clipping plane desactivado");
          }
      }, [clippingPlanesActive]);
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
  
  