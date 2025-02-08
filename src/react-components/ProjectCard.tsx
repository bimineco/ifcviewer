import * as React from 'react'
import { Project } from '../classes/Project';
import * as Router from 'react-router-dom'

interface Props {
    project: Project
}

export function ProjectCard(props: Props){

    const iconLetters = props.project.name.split(' ').slice(0, 2).map(word => word[0].toUpperCase()).join('');
    const colors = ['#0000FF', '#000FFF', '#00FF00', '#FFFF00', '#FFA500', '#FF0000'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return(
        <Router.Link to={`/project/${props.project.id}`}>
            <div className = "project-card">
                <div className="card-header">
                    <p className="card-icon" style={{ backgroundColor: randomColor}}>
                    {iconLetters}
                    </p>
                    <div>
                        <h5 data-project-info="name">
                                {props.project.name}
                        </h5>
                        <p data-project-info="description">
                            {props.project.description}
                        </p>
                    </div>
                </div>
                <div className="card-content">
                    <div className="card-property">
                        <p style={{ color: "#212E3F" }}>Código de Proyecto</p>
                        <p id="project-code" data-project-info="code">
                            {props.project.code}
                        </p>
                    </div>
                    <div className="card-property">
                        <p style={{ color: "#212E3F" }}>Estado</p>
                        <p data-project-info="status">
                            {props.project.status} 
                        </p>
                    </div>
                    <div className="card-property">
                        <p style={{ color: "#212E3F" }}>Tipo</p>
                        <p data-project-info="type">
                            {props.project.type} 
                        </p>
                    </div>
                    <div className="card-property">
                        <p style={{ color: "#212E3F" }}>Presupuesto</p>
                        <p data-project-info="budget">
                            {props.project.budget} €
                        </p>
                    </div>
                    <div className="card-property">
                        <p style={{ color: "#212E3F" }}>Fecha de Finalización</p>
                        <p data-project-info="date">
                            {props.project.date} 
                        </p>
                    </div>
                    <div className="card-property">
                        <p style={{ color: "#212E3F" }}>Progreso Estimado</p>
                        <p data-project-info="progress">
                            {props.project.progress!}% 
                        </p>
                    </div>
                </div>
            </div>
        </Router.Link>
    )
}