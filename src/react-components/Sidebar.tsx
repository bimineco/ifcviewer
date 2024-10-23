import * as React from 'react'
import * as Router from 'react-router-dom'

export function Sidebar(){
    return (
        <aside id="sidebar">
            <img id="company-logo" src="./src/Logo_blanco.jpg" alt="Logo"/>
            <ul id="nav-buttons">
                <Router.Link to={`/`} className="button-main" id="projects-nav-btn">
                    <span className="material-symbols-outlined">apartment</span>
                    Proyectos
                </Router.Link>

                <button className="button-main" id="examples-nav-btn">
                    <span className="material-symbols-outlined">group</span>
                    Ejemplos
                </button>

                <button className="button-main" id="viewer-nav-btn">
                    <span className="material-symbols-outlined">3d_rotation</span>
                    Visor IFC
                </button>
                
            </ul>
        </aside>
    )
}
/*
<Router.Link to={`/projects`} className="button-main" id="projects-nav-btn">
    <span className="material-symbols-outlined">apartment</span>
    Proyectos
</Router.Link>

<Router.Link to={`/examples`} className="button-main" id="examples-nav-btn">
    <span className="material-symbols-outlined">group</span>
    Ejemplos
</Router.Link>

<Router.Link to={`/viewer`} className="button-main" id="viewer-nav-btn">
    <span className="material-symbols-outlined">3d_rotation</span>
    Visor IFC
</Router.Link>
*/