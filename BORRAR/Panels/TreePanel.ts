import * as React from 'react'
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from '@thatopen/components-front'
import * as CUI from "@thatopen/ui-obc";

export default (components: OBC.Components) => {

  const [relationsTree] = CUI.tables.relationsTree({
    components,
    models: [],
    hoverHighlighterName: "hoverEvent",
    selectHighlighterName: "selectEvent",
  });
  relationsTree.preserveStructureOnFilter = true;

  const search = (e: Event) => {
    const input = e.target as BUI.TextInput;
    relationsTree.queryString = input.value;
  }; 
  
  const [classificationsTree] = CUI.tables.classificationTree({
    components,
    classifications: []
  })


  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section 
            label="Árbol de Selección" 
            icon="solar:document-bold" 
            fixed
        >
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input @input=${search} placeholder="Buscar..."></bim-text-input>
            <bim-button style="flex: 0;" @click=${() => (relationsTree.expanded = !relationsTree.expanded)} icon="eva:expand-fill"></bim-button>
          </div>
            ${relationsTree}
        </bim-panel-section>
        <bim-panel-section 
            label="Filtros Rápidos" 
            icon="solar:document-bold" 
            fixed
        >
          ${classificationsTree}
        </bim-panel-section>
      </bim-panel>
    `
  })
}
