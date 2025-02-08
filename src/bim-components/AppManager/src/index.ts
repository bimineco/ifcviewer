import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { User } from "firebase/auth";

export class AppManager extends OBC.Component {
  static uuid = "939bb2bc-7d31-4a44-811d-68e4dd286c35" as const;
  enabled = true;
  grids: Map<string, BUI.Grid> = new Map();

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
