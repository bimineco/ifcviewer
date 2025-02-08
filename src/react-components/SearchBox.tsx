import * as React from 'react'
import * as BUI from "@thatopen/ui"
import * as Router from 'react-router-dom'

interface Props {
    OnChange: (value: string) => void
}

//Pendiente de ver como sobreescribir los valores por defecto
/*
export function SearchBox(props: Props){
    const searchInput = document.getElementById("search-input") as BUI.TextInput
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            props.OnChange(searchInput.value)
        })
    }
    return (
        <div style={{ display: "flex", alignItems: "center", columnGap: 10, width: "40%"}}>

            <bim-text-input className="Prueba" placeholder="Buscar por nombre" id="search-input" style={{ backgroundColor: "var(--background-light)" }}></bim-text-input>

        </div>
    )
}
*/
export function SearchBox(props: Props){
    return (
        <div style={{ display: "flex", alignItems: "center", columnGap: 10, width: "40%"}}>
            <input
                onChange={(e)=>{(props.OnChange(e.target.value))}}
                type='text'
                placeholder='Incluir el nombre del proyecto'
                style={{width:"100%", height: "20px", backgroundColor: "var(--background-light)"}}
            />
        </div>
    )
}
