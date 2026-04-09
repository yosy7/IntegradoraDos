import { useEffect, useMemo, useState } from "react";

export default function EditProjectModal({
  project,
  teams = [],
  onEditProject,
  onClose,
  onOpenMaterials,
  materialsCount = 0,
  submitting = false,
}) {
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setTeamId(project.teamId || "");
      setBudget(project.budget || "");
      setStartDate(project.startDate || "");
      setEndDate(project.endDate || "");
      setDescription(project.description || "");
    }
  }, [project]);

  const selectedTeam = useMemo(() => {
    return teams.find((team) => String(team.id) === String(teamId)) || null;
  }, [teams, teamId]);

  const leaderLabel =
    selectedTeam?.leader && selectedTeam.leader !== "Sin líder"
      ? selectedTeam.leader
      : project?.leader && project.leader !== "Sin líder"
      ? project.leader
      : "Sin líder";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project) return;

    const cleanName = name.trim();
    const cleanDescription = description.trim();
    const cleanBudget = Number(budget);

    if (
      !cleanName ||
      !teamId ||
      budget === "" ||
      !endDate ||
      !cleanDescription
    ) {
      alert("Completa todos los campos.");
      return;
    }

    if (Number.isNaN(cleanBudget) || cleanBudget <= 0) {
      alert("Presupuesto inválido.");
      return;
    }

    await onEditProject(project.id, {
      name: cleanName,
      teamId,
      budget: cleanBudget,
      startDate,
      endDate,
      description: cleanDescription,
    });
  };

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-materials-modal project-modal project-form-modal">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="modal-title-custom m-0">
            <i className="bi bi-folder-fill me-3"></i>
            Editar Proyecto
          </h2>

          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre del Proyecto</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Equipo</label>
            <select
              className="form-select"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              <option value="">Seleccionar equipo</option>
              {teams.map((team) => (
                <option key={team.id} value={String(team.id)}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Líder</label>
            <input
              type="text"
              className="form-control"
              value={leaderLabel}
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Presupuesto</label>
            <input
              type="number"
              className="form-control"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Fecha de inicio</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Fecha de fin</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div className="d-flex justify-content-end gap-3 mt-4">
            <button
              type="button"
              className="project-btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="project-btn-save"
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}