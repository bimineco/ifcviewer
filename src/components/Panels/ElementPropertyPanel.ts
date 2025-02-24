import * as React from 'react'
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from '@thatopen/components-front'
import * as CUI from "@thatopen/ui-obc";

export default (components: OBC.Components) => {

  const [propsTable, updatePropsTable] = CUI.tables.elementProperties({
    components,
    fragmentIdMap: {},
  });

  const highlighter = components.get(OBCF.Highlighter);
  highlighter.events.selectEvent.onHighlight.add((fragmentIdMap) => {
    updatePropsTable({ fragmentIdMap });
    propsTable.expanded = false;
  });

  highlighter.events.selectEvent.onClear.add(() => {
    updatePropsTable({ fragmentIdMap: {} });
  });

const search = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (propsTable) {
    propsTable.queryString = e.target.value;
  }
};
const showProperties = false

return BUI.Component.create<BUI.Panel>(() => {
      return BUI.html`
        <bim-panel id="element-property-panel" ${showProperties ? "" : "hidden"}>
          <bim-panel-section
            name="Información"
            label="Propiedades"
            icon="solar:document-bold"
            fixed
          >
            <bim-text-input @input=${search} placeholder="Buscar..."></bim-text-input>
            ${propsTable}
          </bim-panel-section>
        </bim-panel>
      `;
    })
}

