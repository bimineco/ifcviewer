import React from 'react'
import * as BUI from '@thatopen/ui'
import * as OBC from "@thatopen/components";
import { AppManager } from "../bim-components/AppManager";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import login from "../components/general/Login";

export const Welcome: React.FC = () => {
    React.useEffect(() => {
        BUI.Manager.init();
        const components = new OBC.Components();
        components.init();

        const viewport = BUI.Component.create<BUI.Viewport>(() => {
            return BUI.html`
                <bim-viewport>
                    <bim-grid floating></bim-grid>
                </bim-viewport>
            `;
        });

        const appManager = components.get(AppManager);
        const viewportGrid = viewport.querySelector<BUI.Grid>("bim-grid[floating]")!;
        appManager.grids.set("viewport", viewportGrid);

        // Asegurarse de que el contenedor "app" exista en el DOM
        let appContainer = document.getElementById("content");
        if (!appContainer) {
            appContainer = document.createElement('div');
            appContainer.id = "content";
            document.body.appendChild(appContainer);
        }

        // Aplicar estilos para centrar el contenido
        appContainer.style.display = "flex";
        appContainer.style.justifyContent = "center";
        appContainer.style.alignItems = "center";
        appContainer.style.height = "100vh"; // Ocupar toda la pantalla
        appContainer.style.width = "100vw";

        console.log(appContainer)
        const app = BUI.Component.create<BUI.Grid>(() => {
            return BUI.html`<bim-grid id="app" style="width: 100%; height: 100%; overflow: hidden;"></bim-grid>`;
        });
        appContainer.appendChild(app);

        console
        app.layouts = {
            login: {
                template: `
                "login"
                `,
                elements: { login },
            },
        };
        app.layout = 'login';


        console.log("Welcome initialized");
    }, []);

    return  <div id="content"/>
};