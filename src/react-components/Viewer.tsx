import * as React from 'react'
import * as Router from 'react-router-dom'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function Viewer(){

    //Para poder reasignar:
    let scene: THREE.Scene | null
    let mesh: THREE.Object3D | null
    let renderer: THREE.WebGLRenderer | null
    let cameraControls: OrbitControls | null
    let camera: THREE.PerspectiveCamera | null
    let axes: THREE.AxesHelper | null
    let grid: THREE.GridHelper | null
    let directionalLight: THREE.DirectionalLight | null
    let ambientLight: THREE.AmbientLight | null
    
    const setViewer = () =>{

        scene = new THREE.Scene()

        const viewerContainer = document.getElementById("viewer-container") as HTMLElement

        camera = new THREE.PerspectiveCamera(75)
        camera.position.set(1,2,5)

        if (!renderer){
            renderer = new THREE.WebGLRenderer({alpha:true, antialias: true})
            viewerContainer.append(renderer.domElement)
        }
        

        function resizeViewer(){
            if (!renderer || !camera){return}
            const containerDimensions = viewerContainer.getBoundingClientRect()
            renderer.setSize(containerDimensions.width, containerDimensions.height)
            const aspectRatio = containerDimensions.width/containerDimensions.height
            camera.aspect = aspectRatio
            camera.updateProjectionMatrix()
        }

        window.addEventListener('resize', resizeViewer)
        resizeViewer()

        const boxGeometry = new THREE.BoxGeometry()
        const material = new THREE.MeshStandardMaterial({ 
            color: getComputedStyle(document.documentElement).getPropertyValue('--complementary-dark'),
            roughness: 0.5
        })
        const cube = new THREE.Mesh(boxGeometry,material)

        directionalLight = new THREE.DirectionalLight()
        ambientLight = new THREE.AmbientLight()
        ambientLight.intensity = 0.4

        scene.add(cube,ambientLight,directionalLight)

        cameraControls = new OrbitControls(camera, viewerContainer)

        function renderScene(){
            if(!renderer || !scene || !camera){return}
            renderer.render(scene,camera)
            requestAnimationFrame(renderScene)
            
        }

        renderScene()

        axes = new THREE.AxesHelper()
        grid = new THREE.GridHelper()
        grid.material.transparent = true
        grid.material.opacity = 0.4
        grid.material.color = new THREE.Color("#808080")
        scene.add(axes, grid)

        /*
        const gui = new GUI()
        //document.body.appendChild(gui.domElement);

        const cubeControls = gui.addFolder('Cube')
        cubeControls.add(cube.position, "x", -10,10,1)
        cubeControls.add(cube.position, "y",-10,10,1)
        cubeControls.add(cube.position, "z",-10,10,1)
        cubeControls.add(cube, "visible")
        cubeControls.addColor(cube.material, "color")

        const directionalLightControl = gui.addFolder("Directional Light")
        directionalLightControl.add(directionalLight.position, "x", -20,20,0.5)
        directionalLightControl.add(directionalLight.position, "y", -20,20,0.5)
        directionalLightControl.add(directionalLight.position, "z", -20,20,0.5)
        directionalLightControl.add(directionalLight, "visible")
        directionalLightControl.add(directionalLight, "intensity", 0,1,0.1)
        directionalLightControl.addColor(directionalLight, "color")

        const ambientLightControl = gui.addFolder("Ambient Light")
        ambientLightControl.add(ambientLight, "visible")
        ambientLightControl.add(ambientLight, "intensity", 0,1,0.1)
        ambientLightControl.addColor(ambientLight, "color")


        const objLoader = new OBJLoader()
        const mtlLoader = new MTLLoader()

        mtlLoader.load('../models/Gear/Gear1.mtl', (materials) =>{
            materials.preload()
            objLoader.setMaterials(materials)
            objLoader.load('../models/Gear/Gear1.obj', (mesh) =>{
                mesh.scale.set(0.25,0.25,0.25)
                mesh.position.set(0,0,-10)
                scene.add(mesh)

            })
        })

        const lighTest = new THREE.DirectionalLight(0xffffff, 1);
        lighTest.position.set(0, 10, 10);
        scene.add(lighTest);

        const gltfLoader = new GLTFLoader();
        gltfLoader.load('https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
            (gltf) => {
                const model = gltf.scene;
                model.scale.set(1, 1, 1);  
                model.position.set(0, 2, 0);     
                scene.add(model);    
            },
            undefined,
            (error) => {
                console.error("Error cargando el modelo GLTF:", error);
            }
        );
        */
    }

    React.useEffect(()=>{
        
        setViewer()
        return () =>{
            mesh?.removeFromParent()
            mesh?.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose()
                    child.material.dispose()
                }
            })
            mesh = null
        }

    },[])
    
    return (
        <div id="viewer-container"
        className="dashboard-card"
        style={{ minWidth: 0 }}
        >
        </div>
    )
}