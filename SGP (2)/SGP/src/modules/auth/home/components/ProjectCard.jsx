export default function ProjectCard({ project }) {
  const progress = Number(project.progress || 0);

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-card-icon">
          <i className="bi bi-clipboard-data"></i>
        </div>

        <div className="project-card-text">
          <h5>{project.name}</h5>
          <span>{project.team}</span>
        </div>
      </div>

      <div className="project-budget-row">
        <span className="project-budget-label">Presupuesto</span>
        <strong className="project-budget-value">
          {project.budgetFormatted}
        </strong>
      </div>

      <div className="project-progress-bar">
        <div
          className="project-progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="project-progress-text">{progress}%</div>
    </div>
  );
}