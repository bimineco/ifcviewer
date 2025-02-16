import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";

export const worldsDropdown = (components: OBC.Components) => {
  let dropdown = document.getElementById("worlds-selector");
  if (dropdown && dropdown instanceof BUI.Dropdown) return dropdown;

  const worlds = components.get(OBC.Worlds);
  const worldsList = [...worlds.list.values()];

  const worldOptions = worldsList.map((world: any, index) => {
    return BUI.html`<bim-option label=${world.name} value=${world.uuid} .checked=${index === 0}></bim-option>`;
  });

  dropdown = BUI.Component.create<BUI.Dropdown>(() => {
    return BUI.html`
      <bim-dropdown id="worlds-selector" style="flex: 0">
        ${worldOptions}
      </bim-dropdown>
    `;
  });

  return dropdown;
};
