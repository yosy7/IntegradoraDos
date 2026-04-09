export default function DeleteProjectModal({
  project,
  onDeleteProject,
  onClose,
  submitting = false,
}) {
  const handleDelete = async () => {
    const projectId = project?.idProyecto ?? project?.id ?? null;
    if (!projectId) {
      alert("No se encontró el id del proyecto.");
      return;
    }

    await onDeleteProject(projectId);
  };

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-box">
        <h2 className="delete-modal-title">
          <i className="bi bi-folder-fill"></i>
          Eliminar proyecto
        </h2>

        <p className="delete-modal-text">
          ¿Estás seguro de que deseas eliminar el proyecto{" "}
          <strong>“{project?.nombre || project?.name || ""}”</strong>?
        </p>

        <div className="delete-modal-actions">
          <button
            className="delete-btn-confirm"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "Eliminando..." : "Eliminar"}
          </button>

          <button
            className="delete-btn-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}