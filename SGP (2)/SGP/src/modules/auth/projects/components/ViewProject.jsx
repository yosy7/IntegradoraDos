export default function ViewProjectModal({
  project,
  onClose,
  onOpenMaterials,
  materialsCount = 0,
}) {
  return (
    <div className="custom-modal-backdrop">
      <div className="custom-materials-modal project-modal project-form-modal">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="modal-title-custom m-0">
            <i className="bi bi-folder-fill me-3"></i>
            Ver Proyecto
          </h2>

          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <div className="mb-3">
          <label className="form-label">Nombre del Proyecto</label>
          <input
            type="text"
            className="form-control"
            value={project?.name || ""}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Equipo</label>
          <input
            type="text"
            className="form-control"
            value={project?.team || ""}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Líder</label>
          <input
            type="text"
            className="form-control"
            value={project?.leader || ""}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Presupuesto</label>
          <input
            type="text"
            className="form-control"
            value={project?.budget || ""}
            disabled
          />
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Fecha de inicio</label>
            <input
              type="text"
              className="form-control"
              value={project?.startDate || ""}
              disabled
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Fecha de fin</label>
            <input
              type="text"
              className="form-control"
              value={project?.endDate || ""}
              disabled
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-control"
            rows="3"
            value={project?.description || ""}
            disabled
          ></textarea>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="project-link-materials border-0 bg-transparent p-0"
            onClick={onOpenMaterials}
          >
            <i className="bi bi-stack me-2"></i>
            Ver materiales {materialsCount > 0 ? `(${materialsCount})` : ""}
          </button>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="button" className="project-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}