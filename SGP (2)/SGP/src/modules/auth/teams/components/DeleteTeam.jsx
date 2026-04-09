export default function DeleteTeam({
  team,
  onClose,
  onDelete,
  submitting = false,
}) {
  const handleDelete = async () => {
    const teamId = team?.idEquipo ?? team?.id ?? null;
    if (!teamId) {
      alert("No se encontró el id del equipo.");
      return;
    }

    await onDelete(teamId);
  };

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-box">
        <h2 className="delete-modal-title">
          <i className="bi bi-people-fill"></i>
          Eliminar equipo
        </h2>

        <p className="delete-modal-text">
          ¿Estás seguro de que deseas eliminar el equipo{" "}
          <strong>“{team?.nombre || "Alfa"}”</strong>?
        </p>

        <div className="delete-modal-actions">
          <button
            className="delete-btn-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>

          <button
            className="delete-btn-confirm"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}