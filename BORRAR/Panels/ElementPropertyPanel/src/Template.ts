import * as React from 'react';
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as CUI from '@thatopen/ui-obc';
import { FragmentsGroup } from '@thatopen/fragments';
import { ViewerPanel } from "../../ViewerPanel";
import { ViewerToolbar } from './ElementPropertyPanel';

export interface ViewerToolbarComponentProps {
    components: OBC.Components;
}

export const ViewerToolbarComponent = (Props: ViewerToolbarComponentProps) => {
    const {components} = Props;
    const viewerToolbar = components.get(ViewerToolbar);

    const toolbar = BUI.Component.create<BUI.Toolbar>(() =>{
        const [loadIfcBtn] = CUI.buttons.loadIfc({ components: components })
        loadIfcBtn.tooltipTitle = "Cargar IFC"
        loadIfcBtn.label = ""
        return BUI.html`
            <bim-toolbar style="justify-self: center; margin-bottom: 20px">
                <bim-toolbar-section label="App">
                    <bim-button 
                    tooltip-title="World" 
                    icon="tabler:brush" 
                    @click=${viewerToolbar.onWorldsUpdate}
                    ></bim-button>
                </bim-toolbar-section>
                <bim-toolbar-section label="IFC">
                    ${loadIfcBtn}
                    <bim-button 
                        tooltip-title=${viewerToolbar.isComparing ? "Salir de comparación" : "Comparar modelos"}
                        icon=${viewerToolbar.isComparing ? "ph:arrows-out" : "pajamas:comparison"}
                        @click=${viewerToolbar.handleCompare}
                    ></bim-button>
                </bim-toolbar-section>
                <bim-toolbar-section label="Seleccionar">
                    <bim-button 
                    tooltip-title="Activar Sección"
                    icon="pajamas:snippet"
                    @click=${()=>{ 
                        viewerToolbar.onIsolate
                    }}
                    ></bim-button>
                    <bim-button 
                        tooltip-title="Visibilidad"
                        icon="material-symbols:visibility-outline"
                        @click=${viewerToolbar.onToggleVisibility}
                    ></bim-button>
                    <bim-button 
                        tooltip-title="Aislar"
                        icon="mdi:filter"
                        @click=${viewerToolbar.onIsolate}
                    ></bim-button>
                    <bim-button 
                        tooltip-title="Mostrar Todo"
                        icon="tabler:eye-filled"
                        @click=${viewerToolbar.onShow}
                    ></bim-button>
                    <bim-button 
                    tooltip-title="Panel en el Visor"
                    icon="pajamas:comment-dots"
                    @click=${()=>{
                        viewerToolbar.onVisor
                    }}
                    ></bim-button>
                </bim-toolbar-section>
                <bim-toolbar-section label="Procesado 3D">
                    <bim-button 
                        tooltip-title="Importar"
                        icon="mdi:cube"
                        @click=${viewerToolbar.onFragmentImport}
                    ></bim-button>
                    <bim-button
                        tooltip-title="Exportar"
                        icon="tabler:package-export"
                        @click=${viewerToolbar.onFragmentExport}
                    ></bim-button>
                    <bim-button
                        tooltip-title="Borrar"
                        icon="tabler:trash"
                        @click=${viewerToolbar.onFragmentDispose}
                    ></bim-button>
                </bim-toolbar-section>
                <bim-toolbar-section label="Propiedades">
                    <bim-button 
                        tooltip-title="Mostrar"
                        icon="clarity:list-line"
                        @click=${viewerToolbar.onToggleProperties}
                    ></bim-button>
                    <bim-button
                        tooltip-title="Importar"
                        icon="clarity:import-line"
                        @click=${viewerToolbar.onPropertyImport}
                    ></bim-button>
                    <bim-button
                        tooltip-title="Exportar"
                        icon="clarity:export-line"
                        @click=${viewerToolbar.onPopertyExport}
                    ></bim-button>
                </bim-toolbar-section>
                <bim-toolbar-section label="Grupos">
                <bim-button 
                    tooltip-title="Mostrar"
                    icon="tabler:eye-filled"
                    @click=${viewerToolbar.onClassifier}
                ></bim-button>
            </bim-toolbar-section>
            </bim-toolbar>
        `
    })

    const elementPropertyPanel = BUI.Component.create<BUI.Panel>(() => {
            return BUI.html`
                <bim-panel id="element-property-panel" ?hidden=${!viewerToolbar.showProperties}>
                    <bim-panel-section
                        name="Información"
                        label="Propiedades"
                        icon="solar:document-bold"
                        fixed
                    >
                        <bim-text-input @input=${viewerToolbar.search} placeholder="Buscar..."></bim-text-input>
                        ${viewerToolbar.getPropsTable()}
                    </bim-panel-section>
                </bim-panel>
            `;
        });
    

    return [toolbar, elementPropertyPanel]
}
