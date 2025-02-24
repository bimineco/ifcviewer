import * as React from 'react'
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from '@thatopen/components-front'
import * as CUI from "@thatopen/ui-obc";
import { AppManager } from '../../bim-components/AppManager';

export default (components: OBC.Components) => {

  const appManager = components.get(AppManager);
  const viewportA = appManager.viewportA
  const viewportB = appManager.viewportB

  if (!viewportA || !viewportB) return

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
};
