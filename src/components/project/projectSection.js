import React from 'react';
import {projects} from '../../prototype/projects';

const ProjectCard = React.lazy(() => import('./projectCard'));


const Project = () => {
    return(
        <div className="project-section">
            {projects.map((project, index) => {
                    return (
                        <ProjectCard key={index} project={project} />
                    )
            })}
        </div>
    )
}

export default Project;