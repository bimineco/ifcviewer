import * as React from 'react'
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from '@thatopen/components-front'
import * as CUI from "@thatopen/ui-obc";

export default (components: OBC.Components) => {

  const [worldsTable] = CUI.tables.worldsConfiguration({ components })

  const search = (e: Event) => {
    const input = e.target as BUI.TextInput
    worldsTable.queryString = input.value
  }

return BUI.Component.create<BUI.Panel>(() => {
  return BUI.html `
    <bim-panel>
    <bim-panel-section
        name="world"
        label="Worlds"
        icon="tabler:brush"
        fixed
    >
        <bim-text-input @input=${search} placeholder="Buscar..."></bim-text-input>
        ${worldsTable}  
    </bim-panel-section>
    </bim-panel>
  `;
  })
}