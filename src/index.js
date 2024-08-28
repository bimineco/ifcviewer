import { Project } from "./classes/Project.js"

// Función mostrar:
function showModal(id) {
    const modal = document.getElementById(id);
    if(modal){
        modal.showModal();
    }else{
        console.warn(" The provided ID was not found. ID: ", id);
    }
}

// Seleccionar el boton
const newProjectBtn = document.getElementById('new-project-btn');
if(newProjectBtn){
    newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")});
    //console.log("New projects button value:", newProjectBtn);
} else{
    console.warn("New Project Button not Found");
}

// Seleccionar el formulario:
const projectForm = document.getElementById('new-project-form');
if (projectForm){
    projectForm.addEventListener('submit', (event)=>{
        event.preventDefault()
        const formData = new FormData(projectForm);
        /*
        for (const [key,value] of formData.entries()){
            console.log(`${key}: ${value}`);
        }
        */
        const projectData = {
            name: formData.get("name"),
            code: formData.get("code"),
            description: formData.get("description"),
            type: formData.get("type"),
            status: formData.get("status"),
            date: formData.get("date")
        }

        const project = new Project(projectData);
        console.log(project)
    })
    } else {
    console.warn("The project form was not found. Check the ID!");
}
