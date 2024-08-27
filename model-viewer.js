import { IfcViewerAPI } from 'web-ifc-viewer';
import { projects } from "./projects.js";
import { Color } from 'three';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({container, backgroundColor: new Color(255,255,255)})

viewer.axes.setAxes();
viewer.grid.setGrid();

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const currentProjectID = url.searchParams.get("id");


const currentProject = projects.find(project => project.id === currentProjectID);
console.log(currentProject.url)

viewer.IFC.setWasmPath('wasm/');
viewer.IFC.loadIfcUrl(currentProject.url);

// Utilidades:

const clipperButton = document.getElementById('clipper-button');

let clippingPlanesActive = false;

clipperButton.onclick = () => {
    clippingPlanesActive = !clippingPlanesActive;
    viewer.clipper.active = clippingPlanesActive;
    if(clippingPlanesActive){
        clipperButton.classList.add('active');
    }else{
        clipperButton.classList.remove('active');
    }
}

window.ondblclick = () => {
    if(clippingPlanesActive){
        viewer.clipper.createPlane();
    }
}

window.onkeydown = (event) => {
    if(event.code === 'Delete' && clippingPlanesActive){
        viewer.clipper.deletePlane()
    }
}