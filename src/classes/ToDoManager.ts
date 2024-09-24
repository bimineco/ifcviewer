import {IToDo, ToDo} from "./ToDo"

export class ToDoManager {
    list: ToDo[] = []
    ui: HTMLElement
    defaultToDoId: string | null = null;

    constructor(container: HTMLElement){
        this.ui = container   

        if(this.list.length == 0){
            this.createDefaultToDo();
        }

    }


newToDo(data: IToDo){

    const toDo = new ToDo(data)
    
    toDo.ui.addEventListener("click", ()=>{
        const toDosContainer = document.getElementById("to-do-list")
    })

    this.ui.append(toDo.ui)
    this.list.push(toDo)
    
    return toDo
    }

createDefaultToDo(){

        //Fecha del día actual:
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        let startDate = `${day}/${month}/${year}`; 

        const defaultData : IToDo ={
            name: "Por Defecto",
            user: "JGV",
            description: "N/A",
            status: "Activa",
            date: startDate
        }

        const defaultToDo = this.newToDo(defaultData);
        this.defaultToDoId = defaultToDo.id
    }


}
