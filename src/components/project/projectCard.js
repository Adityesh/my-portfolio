import React from 'react';
import ImageLoader from 'react-load-image';
import { Code, Book } from '../../icons/icons'
const Spinner = React.lazy(() => import('../loader/loaderSpinner'));

function Preloader(props) {
    return <Spinner/>;
}

const ProjectCard = (props) => {
    
    const {title, description, projectImage, projectGithub, projectDemo} = props.project;
    return (
        
            
                
                <div className="project-card">
                <div className="left-card">
                    <h1 className="project-title">{title}</h1>
                    <p className="project-description">
                        {description}
                    </p>
                    <div className="project-buttons">
                        <button className="project-btn" onClick={() => window.open(projectGithub, '_blank')}>Code<Book /></button>
                        <button className="project-btn" onClick={() => window.open(projectDemo, '_blank')}>Live Demo<Code /> </button>
                    </div>
                </div>
                <div className="right-card">
                    <ImageLoader
                        src={projectImage}
                    >
                        <img alt=""/>
                        <div>Error!</div>
                        <div style={{width : '100px', height : '100px', display : 'flex', alignItems : 'center', margin : '0 auto'}}>
                        <Preloader />
                        </div>
                    </ImageLoader>
                    
                </div>
            </div>
        
            
        
            
    )

};


export default ProjectCard;