import { useEffect, useMemo, useState } from "react";
import "../../../styles/projects.css";

import CreateProjectModal from "./components/CreateProject";
import EditProjectModal from "./components/EditProject";
import ViewProjectModal from "./components/ViewProject";
import DeleteProjectModal from "./components/DeleteProject";
import MaterialsProjectModal from "./components/MaterialsProjectModal";
import ProjectRow from "./components/ProjectRow";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../../api/projectService";
import { getTeams } from "../../../api/teamService";

export default function Projects() {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);

  const [materialsContext, setMaterialsContext] = useState(null);
  const [materialsByProject, setMaterialsByProject] = useState({});

  const getFullName = (person) => {
    if (!person) return "";
    return [
      person.nombre,
      person.apellidoPaterno,
      person.apellidoMaterno,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  };

  const normalizeProject = (project) => ({
    id: project.idProyecto || project.id,
    name: project.nombre || project.nombreProyecto || "Sin nombre",
    teamId: project.equipo?.idEquipo
      ? String(project.equipo.idEquipo)
      : project.equipo?.id
      ? String(project.equipo.id)
      : "",
    team:
      project.equipo?.nombreEquipo ||
      project.equipo?.nombre ||
      "Sin equipo",
    leaderId: project.lider?.idUsuario
      ? String(project.lider.idUsuario)
      : project.lider?.id
      ? String(project.lider.id)
      : "",
    leader: getFullName(project.lider) || "Sin líder",
    budget: project.presupuestoTotal ?? 0,
    startDate: project.fechaInicio || "",
    endDate: project.fechaFin || "",
    description: project.descripcion || "",
    status: project.estado || "PENDIENTE",
    original: project,
  });

  const normalizeTeam = (team) => ({
    id: String(team.idEquipo || team.id || ""),
    name: team.nombreEquipo || team.nombre || "Sin nombre",
    leaderId:
      team.lider?.idUsuario
        ? String(team.lider.idUsuario)
        : team.leaderDetail?.id
        ? String(team.leaderDetail.id)
        : team.idLider
        ? String(team.idLider)
        : team.liderId
        ? String(team.liderId)
        : "",
    leader:
      getFullName(team.lider) ||
      getFullName(team.leaderDetail) ||
      team.nombreLider ||
      team.liderNombre ||
      team.leader ||
      "Sin líder",
  });

  const handleGetProjects = async () => {
    try {
      setLoading(true);

      const response = await getProjects();
      const projectList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setProjects(projectList.map(normalizeProject));
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTeams = async () => {
    try {
      const response = await getTeams();
      const teamList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setTeams(teamList.map(normalizeTeam));
    } catch (error) {
      console.error("Error al obtener equipos:", error);
      setTeams([]);
    }
  };

  useEffect(() => {
    handleGetProjects();
    handleGetTeams();
  }, []);

  useEffect(() => {
    if (!projects.length || !teams.length) return;

    setTeams((prev) =>
      prev.map((team) => {
        if (team.leader && team.leader !== "Sin líder") return team;

        const relatedProject = projects.find(
          (p) =>
            String(p.teamId) === String(team.id) &&
            p.leader &&
            p.leader !== "Sin líder"
        );

        if (!relatedProject) return team;

        return {
          ...team,
          leaderId: relatedProject.leaderId || team.leaderId,
          leader: relatedProject.leader || team.leader,
        };
      })
    );
  }, [projects]);

  const handleAddProject = async (formData) => {
    try {
      setSubmitting(true);

      const payload = {
        name: formData.name?.trim() || "",
        teamId: formData.teamId ? Number(formData.teamId) : null,
        budget: Number(formData.budget),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        description: formData.description?.trim() || "",
      };

      console.log("Payload createProject:", payload);

      await createProject(payload);
      setShowCreateModal(false);
      await Promise.all([handleGetProjects(), handleGetTeams()]);
      alert("Proyecto guardado correctamente.");
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      console.log("ERROR COMPLETO CREATE PROJECT:", error?.response?.data);

      const responseData = error?.response?.data;
      const fieldErrors = responseData?.data;

      if (fieldErrors && typeof fieldErrors === "object") {
        const messages = Object.entries(fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");

        alert(messages);
      } else {
        alert(responseData?.message || "No se pudo guardar el proyecto.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async (id, formData) => {
    try {
      setSubmitting(true);

      const selectedTeam = teams.find(
        (team) => String(team.id) === String(formData.teamId)
      );

      const payload = {
        idProyecto: Number(id),
        nombre: formData.name,
        descripcion: formData.description,
        fechaFin: formData.endDate || null,
        presupuestoTotal: Number(formData.budget),
        estado: selectedProject?.status || "PENDIENTE",
        equipo: formData.teamId
          ? { idEquipo: Number(formData.teamId) }
          : null,
        lider: selectedTeam?.leaderId
          ? { idUsuario: Number(selectedTeam.leaderId) }
          : selectedProject?.leaderId
          ? { idUsuario: Number(selectedProject.leaderId) }
          : null,
      };

      console.log("Payload updateProject:", payload);

      await updateProject(id, payload);
      setShowEditModal(false);
      await Promise.all([handleGetProjects(), handleGetTeams()]);
      alert("Proyecto actualizado correctamente.");
    } catch (error) {
      console.error("Error al editar proyecto:", error);
      console.log("ERROR COMPLETO UPDATE PROJECT:", error?.response?.data);

      const responseData = error?.response?.data;
      const fieldErrors = responseData?.data;

      if (fieldErrors && typeof fieldErrors === "object") {
        const messages = Object.entries(fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");

        alert(messages);
      } else {
        alert(responseData?.message || "No se pudo actualizar el proyecto.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      setSubmitting(true);
      await deleteProject(id);
      setShowDeleteModal(false);
      await Promise.all([handleGetProjects(), handleGetTeams()]);
      alert("Proyecto eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      alert(error?.response?.data?.message || "No se pudo eliminar el proyecto.");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreate = () => {
    setSelectedProject(null);
    setShowCreateModal(true);
  };

  const openEdit = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const openView = (project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const openDelete = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const openMaterials = ({ projectId, projectName, readOnly = false }) => {
    setMaterialsContext({
      projectId,
      projectName,
      readOnly,
    });
    setShowMaterialsModal(true);
  };

  const currentMaterials = useMemo(() => {
    const key = materialsContext?.projectId || "draft-project";
    return materialsByProject[key] || [];
  }, [materialsByProject, materialsContext]);

  const handleSaveMaterials = (materials) => {
    const key = materialsContext?.projectId || "draft-project";
    setMaterialsByProject((prev) => ({
      ...prev,
      [key]: materials,
    }));
    setShowMaterialsModal(false);
  };

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.team?.toLowerCase().includes(q) ||
        p.leader?.toLowerCase().includes(q) ||
        String(p.budget ?? "").includes(q)
      );
    });
  }, [query, projects]);

  const occupiedTeamIds = projects
    .filter((p) => (p.status || "").toUpperCase() !== "CANCELADO")
    .map((p) => String(p.teamId || ""))
    .filter(Boolean);

  const availableTeamsForCreate = teams.filter(
    (team) => !occupiedTeamIds.includes(String(team.id))
  );

  const availableTeamsForEdit = selectedProject
    ? [
        ...teams.filter(
          (team) => String(team.id) === String(selectedProject.teamId)
        ),
        ...teams.filter(
          (team) =>
            String(team.id) !== String(selectedProject.teamId) &&
            !occupiedTeamIds.includes(String(team.id))
        ),
      ]
    : teams;

  return (
    <div>
      <h2>
        <i className="bi bi-folder-fill"></i>&nbsp;Proyectos
      </h2>

      <section className="mt-4 d-flex align-items-center">
        <div className="input-group me-auto" style={{ width: 560 }}>
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>

          <input
            type="search"
            className="form-control"
            placeholder="Buscar proyectos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button className="btn btn-success" type="button" onClick={openCreate}>
          <i className="bi bi-plus-lg me-2"></i>
          Crear proyecto
        </button>
      </section>

      <section className="mt-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="teams-table-head">
              <tr>
                <th>Proyecto</th>
                <th>Equipo</th>
                <th>Presupuesto</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Cargando proyectos...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No hay resultados.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p, index) => (
                  <ProjectRow
                    key={p.id || index}
                    project={p}
                    onEdit={() => openEdit(p)}
                    onView={() => openView(p)}
                    onDelete={() => openDelete(p)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showCreateModal && (
        <CreateProjectModal
          teams={availableTeamsForCreate}
          onClose={() => setShowCreateModal(false)}
          onAddProject={handleAddProject}
          onOpenMaterials={() =>
            openMaterials({
              projectId: "draft-project",
              projectName: "Nuevo proyecto",
              readOnly: false,
            })
          }
          materialsCount={(materialsByProject["draft-project"] || []).length}
          submitting={submitting}
        />
      )}

      {showEditModal && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          teams={availableTeamsForEdit}
          onClose={() => setShowEditModal(false)}
          onEditProject={handleEditProject}
          onOpenMaterials={() =>
            openMaterials({
              projectId: selectedProject.id,
              projectName: selectedProject.name,
              readOnly: false,
            })
          }
          materialsCount={(materialsByProject[selectedProject.id] || []).length}
          submitting={submitting}
        />
      )}

      {showViewModal && selectedProject && (
        <ViewProjectModal
          project={selectedProject}
          onClose={() => setShowViewModal(false)}
          onOpenMaterials={() =>
            openMaterials({
              projectId: selectedProject.id,
              projectName: selectedProject.name,
              readOnly: true,
            })
          }
          materialsCount={(materialsByProject[selectedProject.id] || []).length}
        />
      )}

      {showDeleteModal && selectedProject && (
        <DeleteProjectModal
          project={selectedProject}
          onClose={() => setShowDeleteModal(false)}
          onDeleteProject={handleDeleteProject}
          submitting={submitting}
        />
      )}

      {showMaterialsModal && (
        <MaterialsProjectModal
          projectName={materialsContext?.projectName || "Proyecto"}
          materials={currentMaterials}
          readOnly={materialsContext?.readOnly || false}
          onClose={() => setShowMaterialsModal(false)}
          onSave={handleSaveMaterials}
        />
      )}
    </div>
  );
}