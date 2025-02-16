import * as React from 'react'
import * as OBC from '@thatopen/components'
import * as OBCF from '@thatopen/components-front'
import * as BUI from '@thatopen/ui'
import * as CUI from '@thatopen/ui-obc'
import * as THREE from 'three'
import { FragmentsGroup } from '@thatopen/fragments'
import { createWorld } from "../src/components/functions/worlds-factory";
import { TodoCreator } from "../src/bim-components/TodoCreator";
import { ViewerPanel } from '../src/bim-components/ViewerPanel'
import { AppManager } from '../src/bim-components'
import ElementPropertyPanel from '../BORRAR/Panels/ElementPropertyPanel';
import ViewerToolbar from '../BORRAR/Toolbars/ViewerToolbar';
import ProcessModel from '../src/components/general/ProcessModel'
import WordPanel from '../BORRAR/Panels/WorldPanel'

interface Props {
  components: OBC.Components
}

type WorldContext = {
  world: OBC.World
  viewport: HTMLElement
  dispose: () => void
}

const useViewerInitialization = (components: OBC.Components) => {
  const [mainWorld, setMainWorld] = React.useState<WorldContext>();
  const fragmentModel = React.useRef<FragmentsGroup>();

  React.useEffect(() => {
    components.init();
    
    const { world, viewport } = createWorld(components, { name: "Main" });
    setMainWorld({ world, viewport, dispose: () => world.dispose() });

    return () => {
      components.dispose();
      fragmentModel.current?.dispose();
    };
  }, []);

  return { mainWorld, fragmentModel };
};

const useWorldSetup = (components: OBC.Components, world?: OBC.World) => {
  React.useEffect(() => {
    if (!world) return;

    const setupCommonWorldComponents = () => {
      const ifcLoader = components.get(OBC.IfcLoader);
      ifcLoader.setup();

      const fragmentsManager = components.get(OBC.FragmentsManager);
      fragmentsManager.onFragmentsLoaded.add(async (model) => {
        world.scene.three.add(model);
        if (model.hasProperties) await ProcessModel(model, components);
        
        const culler = components.get(OBC.Cullers).list.get(world.uuid);
        model.items.forEach(fragment => culler?.add(fragment.mesh));
        culler && (culler.needsUpdate = true);
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
    };

    setupCommonWorldComponents();
  }, [world]);
};

const useUIInitialization = (components: OBC.Components, mainWorld?: WorldContext) => {
  const [uiInitialized, setUIInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!mainWorld || uiInitialized) return;

    const initializeFloatingUI = () => {
      const floatingGrid = BUI.Component.create<BUI.Grid>(() => {
        return BUI.html`
          <bim-grid floating style="padding: 20px" id="floatingGrid"></bim-grid>
        `;
      });

      const appManager = components.get(AppManager);
      appManager.floatingGrid = floatingGrid;

      const panels = {
        elementProperty: ElementPropertyPanel(components),
        toolbar: ViewerToolbar(components),
        world: WordPanel(components),
        classifier: createClassifierPanel(components)
      };

      floatingGrid.layouts = createLayouts(panels);
      floatingGrid.layout = "main";

      document.getElementById("viewer-container")?.appendChild(floatingGrid);
      setUIInitialized(true);
    };

    initializeFloatingUI();
  }, [mainWorld, uiInitialized]);

  return uiInitialized;
};

const createClassifierPanel = (components: OBC.Components) => {
  const [relationsTree] = CUI.tables.relationsTree({
    components,
    models: [],
    hoverHighlighterName: "hoverEvent",
    selectHighlighterName: "selectEvent",
  });
  
  return BUI.html`
    <bim-panel>
      <bim-panel-section name="classifier" label="Classifier" icon="solar:document-bold" fixed>
        <bim-label>Classifications</bim-label>
        ${relationsTree}
      </bim-panel-section>
    </bim-panel>
  `;
};

const createLayouts = (panels: Record<string, any>) => ({
  main: {
    template: `"empty" 1fr "toolbar" auto / 1fr`,
    elements: { toolbar: panels.toolbar }
  },
  secondary: {
    template: `"empty elementPropertyPanel" 1fr "toolbar toolbar" auto / 1fr 20rem`,
    elements: { toolbar: panels.toolbar, elementPropertyPanel: panels.elementProperty }
  },
  world: {
    template: `"empty worldPanel" 1fr "toolbar toolbar" auto / 1fr 20rem`,
    elements: { toolbar: panels.toolbar, worldPanel: panels.world }
  },
  classifier: {
    template: `"empty classifierPanel" 1fr "toolbar toolbar" auto / 1fr 20rem`,
    elements: { toolbar: panels.toolbar, classifierPanel: panels.classifier }
  }
});

const useComparisonWorld = (components: OBC.Components, showSecondWorld: boolean) => {
  const [compareWorld, setCompareWorld] = React.useState<WorldContext>();

  React.useEffect(() => {
    if (!showSecondWorld) return;

    const { world, viewport } = createWorld(components, { name: "Compare" });
    setCompareWorld({ world, viewport, dispose: () => world.dispose() });

    return () => {
      world.dispose();
      components.get(OBC.Cullers).list.delete(world.uuid);
    };
  }, [showSecondWorld]);

  return compareWorld;
};
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

const useViewportManagement = (
  mainWorld?: WorldContext,
  compareWorld?: WorldContext,
  showSecondWorld?: boolean
) => {
  React.useEffect(() => {
    const container = document.getElementById("viewer-container");
    if (!container || !mainWorld?.viewport) return;

    container.innerHTML = "";
    container.appendChild(mainWorld.viewport);

    if (showSecondWorld && compareWorld?.viewport) {
      compareWorld.viewport.style.clipPath = "inset(0 50% 0 0)";
      container.appendChild(compareWorld.viewport);
      createSplitter(container, mainWorld.viewport, compareWorld.viewport);
    }
  }, [mainWorld?.viewport, compareWorld?.viewport, showSecondWorld]);
};

// Implementación de createSplitter y otros helpers...

export function IFCViewerToolbar({ components }: Props) {
  const [showSecondWorld, setShowSecondWorld] = React.useState(false);
  const { mainWorld, fragmentModel } = useViewerInitialization(components);
  const uiInitialized = useUIInitialization(components, mainWorld);
  const compareWorld = useComparisonWorld(components, showSecondWorld);
  console.log(mainWorld)
  useWorldSetup(components, mainWorld?.world);
  useWorldSetup(components, compareWorld?.world);
  useViewportManagement(mainWorld, compareWorld, showSecondWorld);

  // Resto de la lógica de estado y efectos específicos...

  return (
    <div id="viewer-container" className="dashboard-card" style={{ 
      position: 'relative',
      width: '100%',
      height: '95vh',
      minWidth: 0, 
      maxWidth: 800
    }}></div>
  );
}