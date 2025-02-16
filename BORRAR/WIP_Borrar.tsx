


return (
    /*
    <div>
        <bim-viewport
        id="viewer-container"
        className="dashboard-card"
        style={{ 
            minWidth: 0,
            display: isComparing ? "none" : "block" 
        }}
        />
        {isComparing && (
            <bim-grid gap="0.5rem" style={{ height: "100%", display: "flex" }}>
                <bim-viewport 
                id="main-viewport"
                style={{ 
                    width: "50%", 
                    height: "100%",
                    borderRight: "2px solid var(--bim-ui_bg-base)"
                }}
                />
                <bim-viewport 
                id="compare-viewport"
                style={{ 
                    width: "50%", 
                    height: "100%",
                    borderLeft: "2px solid var(--bim-ui_bg-base)"
                }}
                />
            </bim-grid>
        )}
    </div>
    */
    <bim-viewport
    id="viewportA"//"viewer-container"
    className="dashboard-card"
    style={{ minWidth: 0 }}
    />
)
}


// Comparar Modelos:

const loadIFC = async (world: OBC.World) => {
    const ifcLoader = components.get(OBC.IfcLoader);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ifc';

    input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        
        const model = await ifcLoader.load(file);
        world.scene.three.add(model);
        
        // Configurar propiedades y culling
        model.getLocalProperties();
        if (model.hasProperties) await processModel(model);
        
        const cullers = components.get(OBC.Cullers);
        const culler = cullers.create(world);
        model.items.forEach(fragment => culler.add(fragment.mesh));
        culler.needsUpdate = true;
    });

    input.click();
};

/*
const createWorld = (containerId: string, name?: string) => {
    const worlds = components.get(OBC.Worlds);
    
    const world = worlds.create<
        OBC.SimpleScene,
        OBC.OrthoPerspectiveCamera,
        OBCF.PostproductionRenderer
    >(name);

    const scene = new OBC.SimpleScene(components);
    scene.setup();
    world.scene = scene;
    world.scene.three.background = null

    const viewerContainer = document.getElementById(containerId)!;
    const renderer = new OBCF.PostproductionRenderer(components, viewerContainer);
    world.renderer = renderer;

    const camera = new OBC.OrthoPerspectiveCamera(components);
    world.camera = camera;
    
    world.renderer.postproduction.enabled = true
    camera.controls.setLookAt(3, 3, 3, 0, 0, 0);
    camera.updateAspect();
    
    components.init();
    
    return world;
};
*/
/*
React.useEffect(() => {
    const worlds = components.get(OBC.Worlds);

    if (isComparing) {

        const mainWorld = worlds.list.get("main");
        if (!mainWorld) return;
        
        const mainViewport = document.getElementById("main-viewport");
        if (mainViewport) {
            const canvas = mainWorld.renderer?.domElement;
            if (canvas) {
            mainViewport.appendChild(canvas);
            mainWorld.renderer?.resize();
            }
        }
    
        // 3. Crear World de comparación
        const compareWorld = createWorld("compare-viewport");
        loadIFC(compareWorld);
        
        // 4. Configurar sincronización de cámaras
        const syncCameras = () => {
            const position = new THREE.Vector3();
            const target = new THREE.Vector3();
            mainWorld.camera.controls.getPosition(position);
            mainWorld.camera.controls.getTarget(target);
            compareWorld.camera.controls.setLookAt(
                position.x,
                position.y,
                position.z,
                target.x,
                target.y,
                target.z,
                true
            );
        };
    
        mainWorld.camera.controls.addEventListener("controlend", syncCameras);
        
        } else {
        // Restaurar el World principal a su contenedor original
        const viewerContainer = document.getElementById("viewer-container");
        const mainWorld = worlds.list.get("main");
        
        if (mainWorld && viewerContainer) {
            const canvas = mainWorld.renderer?.domElement;
            if (canvas) {
                viewerContainer.appendChild(canvas);
                mainWorld.renderer?.resize();
            }
        }
    
        // Limpiar Worlds de comparación
        worlds.dispose("compare");
        }
    }, [isComparing]);
*/

















const pte = ()=>{

}
const onCompare = () => {
    let viewportAHovered = false;
    let viewportBHovered = false;

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

    React.useEffect(() => {
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
        
        React.useEffect(() => {
        async function setupIFCLoader() {
            const ifcLoader = this.components.get(OBC.IfcLoader);
            await ifcLoader.setup();
            const highlighter = this.components.get(OBCF.Highlighter);
            highlighter.setup({ world: worldA });
            highlighter.zoomToSelection = true;
        }
        setupIFCLoader();
        }, [components, worldA]);
        
        React.useEffect(() => {
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
    
        
        //const projectInformationPanel = projectInformation(components);
    
        const leftPanel = BUI.Component.create(() => {
        return BUI.html`
            <bim-tabs switchers-full>

            </bim-tabs> 
        `;
        /*return BUI.html`
            <bim-tabs switchers-full>
            <bim-tab name="project" label="Project" icon="ph:building-fill">
                ${projectInformationPanel}
            </bim-tab>
            <bim-tab name="settings" label="Settings" icon="solar:settings-bold">
                ${settings(components)}
            </bim-tab>
            </bim-tabs> 
        `;*/
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
const setupComparison = () => {
    const worlds = components.get(OBC.Worlds);
    
    // Crear dos mundos nuevos
    const world1 = createWorld("viewport-a");
    const world2 = createWorld("viewport-b");
    
    // Configurar sincronización de cámaras
    let isDragging = false;
    let activeViewport: HTMLElement | null = null;

    const syncCameras = (sourceWorld: OBC.World, targetWorld: OBC.World) => {
        const position = new THREE.Vector3();
        const target = new THREE.Vector3();
        sourceWorld.camera.controls.getPosition(position);
        sourceWorld.camera.controls.getTarget(target);
        targetWorld.camera.controls.setLookAt(
            position.x,
            position.y,
            position.z,
            target.x,
            target.y,
            target.z,
            true
        );
    };

    // Configurar eventos para los viewports
    const viewportA = document.getElementById("viewport-a");
    const viewportB = document.getElementById("viewport-b");

    if (viewportA && viewportB) {
        viewportA.onmouseenter = () => activeViewport = viewportA;
        viewportB.onmouseenter = () => activeViewport = viewportB;
        
        const updateCameras = () => {
            if (!activeViewport || !isDragging) return;
            if (activeViewport === viewportA) {
                syncCameras(world1, world2);
            } else {
                syncCameras(world2, world1);
            }
        };

        world1.camera.controls.addEventListener("controlstart", () => {
            isDragging = true;
            activeViewport = viewportA;
        });
        
        world2.camera.controls.addEventListener("controlstart", () => {
            isDragging = true;
            activeViewport = viewportB;
        });

        world1.camera.controls.addEventListener("controlend", () => {
            isDragging = false;
            updateCameras();
        });

        world2.camera.controls.addEventListener("controlend", () => {
            isDragging = false;
            updateCameras();
        });
    }

    setWorldsList([world1, world2]);
};