export default function TeamRow({ team, onEdit, onDelete, onView }) {
  return (
    <tr>
      <td>{team.nombre}</td>
      <td>{team.lider}</td>
      <td>{team.miembros}</td>

      <td className="text-center" style={{ width: 180 }}>
        <button
          className="action-btn"
          title="Editar"
          onClick={() => onEdit(team)}
        >
          <i className="bi bi-pencil-fill action-icon"></i>
        </button>

        <button
          className="action-btn"
          title="Eliminar"
          onClick={() => onDelete(team)}
        >
          <i className="bi bi-trash-fill action-icon"></i>
        </button>

        <button
          className="action-btn"
          title="Ver"
          onClick={() => onView(team)}
        >
          <i className="bi bi-eye-fill action-icon"></i>
        </button>
      </td>
    </tr>
  );
}