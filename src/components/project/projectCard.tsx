import React from 'react';
import ImageLoader from '../common/ImageLoader';
import './project.css';
import { Code, Book } from '../../icons/icons';
import { ProjectItem } from '../../prototype/projects';
import LoaderSpinner from '../loader/loaderSpinner';

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const { title, description, projectImage, projectGithub, projectDemo, projectTags } = project;
  const folderSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <article className="project-card">
      <div className="card-terminal-header">
        <span className="card-path">
          <span style={{ color: 'var(--text-muted)' }}>[{index + 1}]</span> ~/{folderSlug}
        </span>
        <span className="card-badge">● ready</span>
      </div>

      <div className="project-image-wrap">
        <ImageLoader src={projectImage}>
          <img alt={title} width={400} height={225} loading="lazy" decoding="async" />
          <div style={{ padding: '20px', color: 'var(--accent-red)', fontSize: '12px' }}>[!] Image unavailable</div>
          <LoaderSpinner />
        </ImageLoader>
      </div>

      <div className="card-content">
        <h3 className="project-title">{title}</h3>
        <p className="project-description">{description}</p>

        <div className="project-tags">
          {projectTags.map((tag) => (
            <span className="project-tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>

        <div className="card-actions">
          {projectGithub && projectGithub !== '#' && (
            <a
              className="card-btn"
              href={projectGithub}
              target="_blank"
              rel="noopener noreferrer"
              title="View Source Code"
            >
              <Book /> git repo
            </a>
          )}
          {projectDemo && projectDemo !== '#' && (
            <a
              className="card-btn primary"
              href={projectDemo}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Live Application"
            >
              <Code /> live demo ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
