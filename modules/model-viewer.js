import { IfcViewerAPI } from 'web-ifc-viewer';
import { projects } from "./arrayProject.js";
import { Color } from 'three';

import { selectMaterial } from "./three-utils.js";
import { decodeIFCString } from "./decode-ifc.js";

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({container, backgroundColor: new Color(255,255,255)})

viewer.axes.setAxes();
viewer.grid.setGrid();
selectMaterial(viewer);

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const currentProjectID = url.searchParams.get("id");


const currentProject = projects.find(project => project.id === currentProjectID);
console.log(currentProject.url)

viewer.IFC.setWasmPath('wasm/');
viewer.IFC.loadIfcUrl(currentProject.url);

// Utilidades Secciones:
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

//Dimensions
let dimensionsActive = false;
let dimensionsPreviewActive = false;

const measureButton = document.getElementById("measure-button");

measureButton.onclick = () => {
    if (clippingPlanesActive) {
        clipperButton.click();
    }
    dimensionsActive = !dimensionsActive;
    dimensionsPreviewActive = !dimensionsPreviewActive;

    viewer.dimensions.active = dimensionsActive;
    viewer.dimensions.previewActive = dimensionsPreviewActive;
    measureButton.classList.toggle("active");
};

window.addEventListener("dblclick", () => {
    if (dimensionsActive) viewer.dimensions.create();
});

window.addEventListener("keydown", (event) => {
    if (event.code === "Delete" && dimensionsActive) viewer.dimensions.delete();
    viewer.context.renderer.postProduction.update();
});