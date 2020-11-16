import React from 'react';
import {projects} from '../../prototype/projects';

const ProjectCard = React.lazy(() => import('./projectCard'));


const Project = (props) => {
    return(
        <div className="project-section" ref={props.reference}>
            <h1 className="contact-header">My Work</h1>
            {projects.map((project, index) => {
                    return (
                        <ProjectCard key={index} project={project} />
                    )
            })}

        </div>
    )
}

export default Project;