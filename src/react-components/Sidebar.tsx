import * as React from 'react'
import * as Router from 'react-router-dom'

import * as BUI from '@thatopen/ui'

import { auth } from "../firebase";




export function Sidebar(){
    
    const [sidebarAbierto, setSidebarAbierto] = React.useState(true);
    const handleLogout = () => {
        
        auth.signOut().then(() => {
            console.log('Sesión cerrada');
        });
    }
    
    const toggleSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        const root = document.documentElement;
        if (sidebar) {
            if (sidebar.classList.contains('oculto')) {
                sidebar.classList.remove('oculto');
                setSidebarAbierto(true);
                root.style.setProperty('--sidebar-width', '250px');
            } else {
                sidebar.classList.add('oculto');
                setSidebarAbierto(false);
                root.style.setProperty('--sidebar-width', '75px');
            }
        }
    }
    return (
        <aside id="sidebar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                    id="company-logo" 
                    src={sidebarAbierto ? './src/Logo_blanco.jpg' : './src/Logo_Ineco_Small.png'} 
                    style={{ 
                        width: sidebarAbierto ? '200px' : '50px', 
                        height: 'auto',
                        marginTop: sidebarAbierto ? '0' : '10px'
                }} 
                    alt="Logo"
                />
            </div>
            {sidebarAbierto && (
                <div>
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

                        <Router.Link to={`/cv`} className="button-main" id="comp-nav-btn">
                            <span className="material-symbols-outlined">compare</span>
                            Comparar
                        </Router.Link>

                        <Router.Link to={`/toc`} className="button-main" id="toc-nav-btn">
                        <span className="material-symbols-outlined">labs</span>
                            Pruebas TOC
                        </Router.Link>
                    </ul>
                </div>
            )}
            <div style={{ 
                position: 'absolute',
                bottom: '10px',
                display: 'flex',
                justifyContent: sidebarAbierto ? 'space-between' : 'center',
                width: 'var(--sidebar-width)',
            }}> 
                <button style={{
                    fontSize: '12px',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: 'var(--complementary-light)',
                    border: 'none',
                    cursor: 'pointer',
                    
                }} onClick={toggleSidebar}
                title={sidebarAbierto ? 'Ocultar el menú lateral' : 'Mostrar el menú lateral'}
                >
                    <span className="material-symbols-outlined">{sidebarAbierto ? 'arrow_menu_close' : 'arrow_menu_open'}</span>
                </button>
                {sidebarAbierto && (
                <button style={{
                    fontSize: '12px',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: 'var(--complementary-light)',
                    border: 'none',
                    cursor: 'pointer',
                    marginRight: '50px',
                }} onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    Cerrar sesión
                </button>
                )}
            </div>
        </aside>
    )
}