export default function ProjectRow({ project, onEdit, onView, onDelete }) {
  return (
    <tr>
      <td>{project.name}</td>
      <td>{project.team}</td>
      <td>${Number(project.budget || 0).toLocaleString("es-MX")}</td>

      <td className="text-center" style={{ width: 180 }}>
        <button className="action-btn" title="Editar" onClick={onEdit}>
          <i className="bi bi-pencil-fill action-icon"></i>
        </button>

        <button className="action-btn" title="Eliminar" onClick={onDelete}>
          <i className="bi bi-trash-fill action-icon"></i>
        </button>

        <button className="action-btn" title="Ver" onClick={onView}>
          <i className="bi bi-eye-fill action-icon"></i>
        </button>
      </td>
    </tr>
  );
}