import { useEffect, useMemo, useState } from "react";

export default function CreateProjectModal({
  teams = [],
  onAddProject,
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

  const availableTeams = useMemo(() => {
    return teams.filter((team) => {
      const hasProject =
        team.hasProject === true ||
        team.tieneProyecto === true ||
        team.projectAssigned === true ||
        team.assignedProject === true ||
        team.idProyecto != null ||
        team.projectId != null ||
        team.proyecto != null ||
        team.project != null;

      return !hasProject;
    });
  }, [teams]);

  const selectedTeam = useMemo(() => {
    return (
      availableTeams.find((team) => String(team.id) === String(teamId)) || null
    );
  }, [availableTeams, teamId]);

  const leaderLabel =
    selectedTeam?.leader && selectedTeam.leader !== "Sin líder"
      ? selectedTeam.leader
      : selectedTeam?.lider && selectedTeam.lider !== "Sin líder"
      ? selectedTeam.lider
      : "Sin líder";

  const resetForm = () => {
    setName("");
    setTeamId("");
    setBudget("");
    setStartDate("");
    setEndDate("");
    setDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanDescription = description.trim();
    const cleanBudget = Number(budget);

    if (!cleanName || budget === "" || !endDate || !cleanDescription) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    if (Number.isNaN(cleanBudget) || cleanBudget <= 0) {
      alert("Presupuesto inválido.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      alert("La fecha de inicio no puede ser mayor que la fecha de fin.");
      return;
    }

    const payload = {
      name: cleanName,
      teamId: teamId ? Number(teamId) : null,
      budget: cleanBudget,
      startDate: startDate || null,
      endDate: endDate || null,
      description: cleanDescription,
    };

    console.log("Payload desde CreateProjectModal:", payload);

    try {
      await onAddProject(payload);
      resetForm();
    } catch (error) {
      console.error("Error en CreateProjectModal:", error);
    }
  };

  useEffect(() => {
    if (
      teamId &&
      !availableTeams.some((team) => String(team.id) === String(teamId))
    ) {
      setTeamId("");
    }
  }, [availableTeams, teamId]);

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-materials-modal project-modal project-form-modal">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="modal-title-custom m-0">
            <i className="bi bi-folder-fill me-3"></i>
            Crear Proyecto
          </h2>

          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            disabled={submitting}
          ></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Nombre del Proyecto <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Equipo <span className="text-muted">(Opcional)</span>
            </label>
            <select
              className="form-select"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              disabled={submitting}
            >
              <option value="">Sin equipo</option>

              {availableTeams.map((team) => (
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
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Presupuesto <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              disabled={submitting}
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
                disabled={submitting}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Fecha de fin <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label">
              Descripción <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            ></textarea>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="project-link-materials border-0 bg-transparent p-0"
              onClick={onOpenMaterials}
              disabled={submitting}
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
              {submitting ? "Guardando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}