import { MeshBasicMaterial } from "three";

export function selectMaterial(ifcViewer) {
    const preSelectMaterial = new MeshBasicMaterial({
        transparent: true,
        opacity: 0.4,
        color: 0x111111,
        depthTest: true,
    });
    const selectMaterial = new MeshBasicMaterial({
        transparent: true,
        opacity: 0.8,
        color: 0xffcd26,
        depthTest: false,
    });
    ifcViewer.IFC.selector.preselection.material = preSelectMaterial;
    ifcViewer.IFC.selector.selection.material = selectMaterial;
}