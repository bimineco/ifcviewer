import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as THREE from "three";
import projectInformation from "../components/Panels/ProjectInformation";
import settings from "../components/Panels/Settings";
import { createWorld } from "../components/functions/worlds-factory";
import { useEffect } from "react";
import {FragmentsGroup, IfcProperties} from '@thatopen/fragments'

interface Props{
  components: OBC.Components
}

export function IFCCompare(props: Props){
  const components : OBC.Components = props.components

  let viewportAHovered = false;
  let viewportBHovered = false;

  //const components = new OBC.Components();

  const { world: worldA, viewport: viewportA } = createWorld(components, {
    name: "Main",
  });

  viewportA.onmouseover = () => {
    viewportAHovered = true;
    viewportBHovered = false;
  };

  const { world: worldB, viewport: viewportB } = createWorld(components, {
    name: "Second",
  });

  viewportB.onmouseover = () => {
    viewportAHovered = false;
    viewportBHovered = true;
  };

  viewportB.style.clipPath = "inset(0 50% 0 0)";

  components.init();

  useEffect(() => {
    const updateCameraA = () => {
      if (!viewportAHovered) return;
      const position = new THREE.Vector3();
      const target = new THREE.Vector3();
      worldA.camera.controls.getPosition(position);
      worldA.camera.controls.getTarget(target);
      worldB.camera.controls.setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z,
        true,
      );
    };

    const updateCameraB = () => {
      if (!viewportBHovered) return;
      const position = new THREE.Vector3();
      const target = new THREE.Vector3();
      worldB.camera.controls.getPosition(position);
      worldB.camera.controls.getTarget(target);
      worldA.camera.controls.setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z,
        true,
      );
    };

    worldA.camera.controls.addEventListener("update", updateCameraA);
    worldB.camera.controls.addEventListener("update", updateCameraB);

    return () => {
      worldA.camera.controls.removeEventListener("update", updateCameraA);
      worldB.camera.controls.removeEventListener("update", updateCameraB);
    };
  }, [viewportAHovered, viewportBHovered, worldA, worldB]);
  
  useEffect(() => {
    async function setupIFCLoader() {
      const ifcLoader = this.components.get(OBC.IfcLoader);
      await ifcLoader.setup();
      const highlighter = this.components.get(OBF.Highlighter);
      highlighter.setup({ world: worldA });
      highlighter.zoomToSelection = true;
    }
    setupIFCLoader();
    }, [components, worldA]);
  
  useEffect(() => {
    const fragments = components.get(OBC.FragmentsManager);
    const indexer = components.get(OBC.IfcRelationsIndexer);
    const classifier = components.get(OBC.Classifier);
    classifier.list.CustomSelections = {};

    const handleFragmentsLoaded = async (model: FragmentsGroup) => {
      if (model.hasProperties) {
        await indexer.process(model);
        classifier.byEntity(model);
      }
  
      const worldsSelector = document.getElementById("worlds-selector");
      if (!(worldsSelector instanceof BUI.Dropdown)) return;

      const worldID = worldsSelector.value[0];
      const worlds = components.get(OBC.Worlds);
      const world = worlds.list.get(worldID);
      if (!world) return;

      for (const fragment of model.items) {
        world.meshes.add(fragment.mesh);
      }
      world.scene.three.add(model);
    };

    fragments.onFragmentsLoaded.add(handleFragmentsLoaded);
    return () => {
      fragments.onFragmentsLoaded.remove(handleFragmentsLoaded);
    };
  }, [components]);

    
  const projectInformationPanel = projectInformation(components);

  const leftPanel = BUI.Component.create(() => {
    return BUI.html`
      <bim-tabs switchers-full>
        <bim-tab name="project" label="Project" icon="ph:building-fill">
          ${projectInformationPanel}
        </bim-tab>
        <bim-tab name="settings" label="Settings" icon="solar:settings-bold">
          ${settings(components)}
        </bim-tab>
      </bim-tabs> 
    `;
  });

  const splitView = BUI.Component.create(() => {
    const onSliderCreated = (e?: Element) => {
      if (!e) return;
      const slider = e as HTMLDivElement;

      const drag = (e: MouseEvent) => {
        const rect = viewportA.getBoundingClientRect();
        const x = e.clientX - rect.left;
        let widthPercentage = (x / rect.width) * 100;
        widthPercentage = Math.max(0, Math.min(100, widthPercentage));
        slider.style.left = `${widthPercentage}%`;
        viewportB.style.clipPath = `inset(0 ${100 - widthPercentage}% 0 0)`;
      };

      const stopDragging = () => {
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", stopDragging);
      };

      slider.onmousedown = () => {
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", stopDragging);
      };
    };

    return BUI.html`
      <div style="position: relative">
        ${viewportA}
        ${viewportB}
        <div ${BUI.ref(onSliderCreated)} style="position: absolute; top: 0; left: 50%; width: 5px; height: 100%; background-color: black; cursor: ew-resize;"
        ></div>
      </div>
    `;
  });

  const app = document.getElementById("app") as BUI.Grid;
  app.layouts = {
    main: {
      template: `
        "leftPanel splitView" 1fr
        /26rem 1fr
      `,
      elements: {
        leftPanel,
        splitView,
      },
    },
  };

  app.layout = "main";

  return app;
}