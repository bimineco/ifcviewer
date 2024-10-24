import * as React from 'react'
import * as Router from 'react-router-dom'

interface Props {
    OnChange: (value: string) => void
}

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