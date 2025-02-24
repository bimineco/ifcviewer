import * as OBF from "@thatopen/components-front";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as THREE from "three";

export const createWorld = (
  components: OBC.Components,
  config: { name: string },
) => {
  
  const worlds = components.get(OBC.Worlds);

  const world = worlds.create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBF.PostproductionRenderer
  >();
  world.name = config.name;

  world.scene = new OBC.SimpleScene(components);
  world.scene.setup();
  world.scene.three.background = null

  const viewport = BUI.Component.create<BUI.Viewport>(() => {
    return BUI.html`
    <bim-viewport 
      id="${config.name}"	
      style="position: absolute; width: 100%; height: 100vh;"
      className="dashboard-card"
      >
      <bim-grid floating></bim-grid>
    </bim-viewport>
  `;
  });

  world.renderer = new OBF.PostproductionRenderer(components, viewport);
  const { postproduction } = world.renderer;

  const cullers = components.get(OBC.Cullers)
  const culler = cullers.create(world);
  culler.config.threshold = 5

  world.camera = new OBC.OrthoPerspectiveCamera(components);
  world.camera.controls.restThreshold = 0.25;
  
  world.renderer.postproduction.enabled = false //true
  world.camera.controls.setLookAt(5,5,5,0,0,0)
  world.camera.updateAspect()

  const worldGrid = components.get(OBC.Grids).create(world);
  worldGrid.material.uniforms.uColor.value = new THREE.Color(0xffffff) //new THREE.Color(0x424242);
  worldGrid.material.uniforms.uSize1.value = 1//2;
  worldGrid.material.uniforms.uSize2.value = 4//8;

  const resizeWorld = () => {
    if (!world || !world.camera) {
      console.error("resizeWorld: No se puede ejecutar, cámara no inicializada.");
      return;
    }
    console.log("Cámara encontrada:", world.camera);
    world.renderer?.resize();
    world.camera.updateAspect();
  };

  viewport.addEventListener("resize", resizeWorld);

  components.onInit.add(() => {
    postproduction.enabled = true;
    postproduction.customEffects.excludedMeshes.push(worldGrid.three);
    postproduction.setPasses({ custom: true, ao: true, gamma: true });
    postproduction.customEffects.lineColor = 0x17191c;

    world.camera.controls.addEventListener("rest", ()=>{
      culler.needsUpdate = true

    })
  });
  
  components.init();
  return { world, viewport };
};
