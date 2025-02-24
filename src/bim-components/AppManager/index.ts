import * as React from "react";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as CUI from '@thatopen/ui-obc'
import { User } from "firebase/auth";
import { FragmentsGroup } from '@thatopen/fragments';
import { ViewerPanel } from "../ViewerPanel";


export class AppManager extends OBC.Component {
  static uuid = "a619bf89-16b3-4336-8e44-5de493625d83" as const;
  enabled = true;
  grids: Map<string, BUI.Grid> = new Map()
  floatingGrid: BUI.Grid | undefined
  fragmentModel: FragmentsGroup | undefined
  viewerPanelRef: ViewerPanel
  classificationsTree: ReturnType<typeof CUI.tables.classificationTree>[0]
  updateClassificationsTree: ReturnType<typeof CUI.tables.classificationTree>[1]
  worldA : OBC.World | undefined
  worldB : OBC.World | undefined
  viewportA : BUI.Viewport | undefined
  viewportB : BUI.Viewport | undefined


  public state = {
    visorActive: false,
    propertiesActive: false,
    isComparing: false
  };

  constructor(components: OBC.Components) {
    super(components)
    this.fragmentModel = new FragmentsGroup();
    [this.classificationsTree, this.updateClassificationsTree] = CUI.tables.classificationTree({
      components,
      classifications: []
    });

  }

  async loadClassifications(classifications:[]) {
    try {
      this.updateClassificationsTree({ classifications });
      setTimeout(() => {
        console.log("Classifications cargadas:", classifications);
        console.log("Nuevo estado del árbol de clasificaciones:", this.classificationsTree);
      }, 100);
    } catch (error) {
      console.error("Error en loadClassifications:", error);
    }
  }


  public updateVisorActive(newState:  boolean )  {
    this.state.visorActive = newState
  }
  public updatePropertiesActive(newState:  boolean )  {
    this.state.propertiesActive = newState
  }

  public updateComparingActive(newState:  boolean )  {
    this.state.isComparing = newState
  }



  readonly onUserLogin = new OBC.Event<User>();
  readonly onUserSignOut = new OBC.Event<undefined>();

  private _user: User | null = null;
  set user(value: User | null) {
    this._user = value;
    if (value) {
      this.onUserLogin.trigger(value);
    } else {
      this.onUserSignOut.trigger();
    }
  }

  get user() {
    return this._user;
  }
}