import * as React from 'react'
import * as Router from 'react-router-dom'
import {
    signOut
} from "firebase/auth";
import { auth } from "../firebase";
export function Sidebar(){
    const handleLogout = () => {
        
        auth.signOut().then(() => {
            console.log('Sesión cerrada');
        });
    }
    return (
        <aside id="sidebar">
            <img id="company-logo" src="./src/Logo_blanco.jpg" alt="Logo"/>
            <ul id="nav-buttons">
                <Router.Link to={`/`} className="button-main" id="projects-nav-btn">
                    <span className="material-symbols-outlined">apartment</span>
                    Proyectos
                </Router.Link>

                <Router.Link to={`/users`}  className="button-main" id="examples-nav-btn">
                    <span className="material-symbols-outlined">group</span>
                    Usuarios
                </Router.Link>

                <Router.Link to={`/viewer`} className="button-main" id="viewer-nav-btn">
                    <span className="material-symbols-outlined">3d_rotation</span>
                    Visor IFC
                </Router.Link>

                <Router.Link to={`/toc`} className="button-main" id="toc-nav-btn">
                <span className="material-symbols-outlined">labs</span>
                    Pruebas TOC
                </Router.Link>
            </ul>
            <div style={{ 
                position: 'absolute',
                bottom: 0,
                left: 200,
                padding: '10px'
            }}>
                <button style={{
                    fontSize: '12px',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    backgroundColor: 'var(--complementary-light)',
                    border: 'none',
                    cursor: 'pointer'
                }} onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    Cerrar sesión
                </button>
            </div>
        </aside>
    )
}