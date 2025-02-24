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

import { AppManager } from '../bim-components'
import ViewerToolbar from '../components/Toolbars/ViewerToolbar';
import ProcessModel from '../components/general/ProcessModel'
import EPP from '../components/Panels/ElementPropertyPanel';
import WP from '../components/Panels/WorldPanel'
import TP from '../components/Panels/TreePanel'
import SV from '../components/Viewer/SplitView'

interface Props{
  components: OBC.Components
}
export function IFCViewer(props: Props){

const components : OBC.Components = props.components
const viewerPanelRef = React.useRef<ViewerPanel | null>(null);

const [mainWorld, setMainWorld] = React.useState<OBC.World>();
const [compareWorld, setCompareWorld] = React.useState<OBC.World>();
const [viewportA, setViewportA] = React.useState<HTMLElement>();
const [viewportB, setViewportB] = React.useState<HTMLElement>();
const [showSecondWorld, setShowSecondWorld] = React.useState(false);
const [uiInitialized, setUIInitialized] = React.useState(false);
const setupUIRef = React.useRef<(() => void) | null>(null);

let fragmentModel: FragmentsGroup | undefined
const appManager = components.get(AppManager);

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
  const viewerContainer = document.getElementById('viewer-container');

  if(!viewerContainer) {
    console.log("No hay viewerContainer")
    return
  }

  const floatingGrid = BUI.Component.create<BUI.Grid>(() => BUI.html`
    <bim-grid floating style="padding: 20px" id="floating-grid"></bim-grid>
  `);
  appManager.floatingGrid = floatingGrid;

  const elementPropertyPanel = EPP(components);
  const toolbar = ViewerToolbar(components);
  const worldPanel = WP(components);
  const treePanel = TP(components);
  const splitView = SV(components);

  
  floatingGrid.layouts = {
    main: {
      template: `"empty" 1fr 
        "toolbar" auto 
        / 1fr`,
      elements: { toolbar }
    },
    secondary: {
      template: `"empty elementPropertyPanel" 1fr 
        "toolbar toolbar" auto 
        / 1fr 20rem`,
      elements: { toolbar, elementPropertyPanel }
    },
    world: {
      template: `"empty worldPanel" 1fr 
        "toolbar toolbar" auto 
        / 1fr 20rem`,
      elements: { toolbar, worldPanel }
    },
    tree: {
      template: `"empty treePanel" 1fr 
        "toolbar toolbar" auto 
        / 1fr 20rem`,
      elements: { toolbar, treePanel }
    },
    compare: {
      template: `"splitView" 1fr 
        "toolbar toolbar" auto 
        / 1fr 20rem`,
      elements: { toolbar, splitView }
    },
    clean:{
      template: `"empty" 1fr 
        / 1fr`,
      elements: { }
    }
  };

  floatingGrid.layout = 'main';
  /*
  const handleButtonClick = () => {
    if (!floatingGrid) return
    if (floatingGrid.layout !== "clean") {
      floatingGrid.layout = "clean"
    } else {
      floatingGrid.layout = "tree"
    }
  }
  const pruebaButton = BUI.Component.create<BUI.Button>(() => {
    return BUI.html`
      <bim-button
        tooltip-title="IFCViewerToolbar"
        icon="material-symbols:visibility-outline"
        style="position: absolute; width: 45px; height:30px; top: 0; left: 0;"
        @click=${() => {
          console.log("Botón presionado");
          console.log("appManager:", appManager);
          handleButtonClick();
        }}
        >
      </bim-button>
    `}
  )
  */
  setTimeout(() => {
    viewerContainer.appendChild(floatingGrid)
    
    //floatingGrid.requestUpdate();
    //viewerContainer.appendChild(pruebaButton)
  }, 200);

  
  setUIInitialized(true);
}, [components, viewportA]);

console.log("Estado actual:", {
  mainWorld: !!mainWorld,
  compareWorld: !!compareWorld,
  viewportA: !!viewportA,
  viewportB: !!viewportB,
  showSecondWorld
});

React.useEffect(() => {
  if (!mainWorld || !viewportA) {
    return;
  }

  const viewerContainer = document.getElementById("viewer-container");
  if (viewerContainer && !viewerContainer.contains(viewportA)) {
    viewerContainer.appendChild(viewportA)
  }
}, [mainWorld, viewportA]);

React.useEffect(() => {
  if (mainWorld && !uiInitialized) {
    initializeUI();
    setupUIRef.current = initializeUI;
  }
}, [mainWorld, uiInitialized, initializeUI]);

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

