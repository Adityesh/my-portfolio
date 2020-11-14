import React from 'react';
import ImageLoader from 'react-load-image';
import './project.css';
import { Code, Book } from '../../icons/icons'
const Spinner = React.lazy(() => import('../loader/loaderSpinner'));

function Preloader(props) {
    return <Spinner/>;
}



const ProjectCard = (props) => {
    
    const {title, description, projectImage, projectGithub, projectDemo, projectTags} = props.project;
    
    return (
        
            
                
                <div className="project-card">
                <div className="left-card">
                    <h1 className="project-title">{title}</h1>
                    <p className="project-description">
                        {description}
                    </p>
                    <div className='project-tags'>
                        <p>Tags: </p>
                        {projectTags.map((tag, index) => {
                            console.log(tag)
                            return (
                                <span className='project-tag' key={index}>{tag}</span>
                            )
                        })}
                    </div>
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
                        
                        <Preloader />
                        
                    </ImageLoader>
                    
                </div>
            </div>
        
            
        
            
    )

};


export default ProjectCard;