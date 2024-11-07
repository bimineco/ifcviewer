import React from 'react'
import * as BUI from '@thatopen/ui'
export function UserPage(){
    
    const userTable = BUI.Component.create<BUI.Table>(() => {

        const onTableCreated = (element?: Element) => {
            const table = element as BUI.Table

            table.data = [
                {
                    data: {
                        Name: "Julián Groba",
                        Task: "Develop BIM Web",
                        Role: "Experto 3"
                    }
                },
                {
                    data: {
                        Name: "Diego Sánchez",
                        Task: "Supervise",
                        Role: "Experto 2"
                    }
                },
                {
                    data: {
                        Name: "Jose Gijón",
                        Task: "Help",
                        Role: "Experto 3"
                    }
                },
                {
                    data: {
                        Name: "Jorge Torrico",
                        Task: "N/A",
                        Role: "Gerente"
                    }
                },
                {
                    data: {
                        Name: "Elena Sebastián",
                        Task: "N/A",
                        Role: "Gerente"
                    }
                },
                {
                    data: {
                        Name: "Rodrigo Salas",
                        Task: "Blender",
                        Role: "N/A"
                    }
                }                  
            ]
        }

        return BUI.html `
        <bim-table ${BUI.ref(onTableCreated)}></bim-table>
        `
    })

    const content = BUI.Component.create<BUI.Panel>(()=>{
        return BUI.html `
        <bim-panel style="border-radius: 0px">
            <bim-panel-section label="Tasks">
                ${userTable}
            </bim-panel-section>
        </bim-panel>
        `
    })
    const sidebar = BUI.Component.create<BUI.Component>(() =>{
        const buttonStyles ={
            "height":"50px"
        }
        return BUI.html`
            <div style="padding: 4px">
                <bim-button
                style=${BUI.styleMap(buttonStyles)}
                icon="fa-solid:user-cog"
                @click = ${() => {
                    console.log(userTable.value)
                }}
                ></bim-button>
                <bim-button
                style=${BUI.styleMap(buttonStyles)}
                icon="mdi:file"
                @click = ${() => {
                    const csvData = userTable.csv
                    const blob = new Blob([csvData], {type:"text/csv"})
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "users.csv"
                    a.click()
                }}
                ></bim-button>
            </div>
        `
    })

    const footer = BUI.Component.create<BUI.Component>(() => {
        return BUI.html`
        <div style="display: flex; justify-content: center; vertical-align: middle">
            <bim-lable>Ingeniería Digital y BIM</bim-lable>
        </div>
        `
    })

    const gridLayoyut: BUI.Layouts = {
        primary: {
            template:`
                "header header" 40px
                "content sidebar" 1fr
                "footer footer" 20px
                / 1fr 60px
            `,
            elements: {
                header: (()=>{
                    const inputBox = BUI.Component.create<BUI.TextInput>( () => {
                        return BUI.html`
                        <bim-text-input style="padding: 8px" placeholder="Search Users">
                        </bim-text-input>
                        `
                    })
                    inputBox.addEventListener("input", ()=>{
                        userTable.queryString = inputBox.value
                    })

                    return inputBox
                })(),
                sidebar,
                content,
                footer,
            }
        }
    }
    React.useEffect(()=>{
        const grid = document.getElementById("bimGrid") as BUI.Grid
        grid.layouts = gridLayoyut
        grid.layout = "primary"
    },[])
    return(
        <div>
            <bim-grid id="bimGrid">
            </bim-grid>
        </div>
    )
}