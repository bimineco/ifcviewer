export class Project {
    name
    code
    description
    type
    status
    date

    constructor(data){
        this.name = data.name
        this.code = data.code
        this.description = data.description
        this.type = data.type
        this.status = data.status
        this.date = data.date
    }
}