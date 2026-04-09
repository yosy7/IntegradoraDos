import { useEffect, useMemo, useState } from "react";
import {
  getTeams,
  getTeamById,
  getTeamMembers,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../../../api/teamService";
import { getAvailableUsersForTeam } from "../../../api/userService";
import { getAvailableProjectsForTeam } from "../../../api/projectService";

import TeamRow from "./components/TeamRow";
import CreateTeam from "./components/CreateTeam";
import ViewTeam from "./components/ViewTeam";
import EditTeam from "./components/EditTeam";
import DeleteTeam from "./components/DeleteTeam";
import SuccessModal from "./components/SuccessModal";

export default function Teams() {
  const [query, setQuery] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showCreatedSuccess, setShowCreatedSuccess] = useState(false);
  const [showEditedSuccess, setShowEditedSuccess] = useState(false);
  const [showDeletedSuccess, setShowDeletedSuccess] = useState(false);

  const getNombreCompleto = (persona) => {
    if (!persona) return "";
    return [persona.nombre, persona.apellidoPaterno, persona.apellidoMaterno]
      .filter(Boolean)
      .join(" ")
      .trim();
  };

  const getRolSafe = (rol) => {
    if (!rol) return "";
    if (typeof rol === "string") return rol;
    if (typeof rol === "object") return rol.nombre || rol.nombreRol || "";
    return "";
  };

  const extractList = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const normalizeUser = (u) => ({
    id: String(u.idUsuario || u.id || ""),
    nombre: getNombreCompleto(u) || u.nombreCompleto || u.nombre || "Sin nombre",
    correo: u.correo || u.email || "Sin correo",
    username: u.username || u.usuario || "Sin usuario",
    rol: getRolSafe(u.rol) || u.nombreRol || "",
  });

  const normalizeMembers = (list = []) =>
    list.map((m, index) => ({
      id: String(m.idUsuario || m.id || index + 1),
      nombre: getNombreCompleto(m) || m.nombreCompleto || m.nombre || "Sin nombre",
      correo: m.correo || m.email || "Sin correo",
      username: m.username || m.usuario || "Sin usuario",
      rol: getRolSafe(m.rol) || m.nombreRol || "",
    }));

  const buildFallbackTeam = (team) => ({
    id: String(team.idEquipo || team.id || ""),
    nombre: team.nombreEquipo || team.nombre || "Sin nombre",
    lider: "Sin líder",
    liderId: "",
    proyecto: team.proyecto?.nombreProyecto || team.proyecto?.nombre || "",
    proyectoId: team.proyecto?.idProyecto
      ? String(team.proyecto.idProyecto)
      : team.proyecto?.id
      ? String(team.proyecto.id)
      : "",
    miembros: 0,
    miembrosIds: [],
    membersDetail: [],
    correoLider: "Sin correo",
    logo: team.logo || "",
    presupuesto: team.presupuesto ?? 100000,
    progreso: team.progreso ?? 45,
    original: team,
  });

  const normalizeTeam = (team, integrantes = []) => {
    const membersDetail = normalizeMembers(integrantes);

    const possibleLeader =
      team.lider || team.usuarioLider || team.encargado || null;

    let leaderData = null;

    if (possibleLeader) {
      leaderData = {
        id: String(possibleLeader.idUsuario || possibleLeader.id || ""),
        nombre:
          getNombreCompleto(possibleLeader) ||
          possibleLeader.nombreCompleto ||
          possibleLeader.nombre ||
          "Sin líder",
        correo: possibleLeader.correo || possibleLeader.email || "Sin correo",
        username: possibleLeader.username || possibleLeader.usuario || "Sin usuario",
        rol: getRolSafe(possibleLeader.rol) || possibleLeader.nombreRol || "",
      };
    }

    if (!leaderData && membersDetail.length > 0) {
      const byRole = membersDetail.find((m) =>
        (m.rol || "").toLowerCase().includes("lider")
      );
      if (byRole) leaderData = byRole;
    }

    const leaderId = leaderData?.id ? String(leaderData.id) : "";
    const membersWithoutLeader = membersDetail.filter(
      (m) => String(m.id) !== leaderId
    );

    return {
      id: String(team.idEquipo || team.id || ""),
      nombre: team.nombreEquipo || team.nombre || "Sin nombre",
      lider: leaderData?.nombre || "Sin líder",
      liderId: leaderId,
      proyecto: team.proyecto?.nombreProyecto || team.proyecto?.nombre || "",
      proyectoId: team.proyecto?.idProyecto
        ? String(team.proyecto.idProyecto)
        : team.proyecto?.id
        ? String(team.proyecto.id)
        : "",
      miembros: membersWithoutLeader.length,
      miembrosIds: membersWithoutLeader.map((m) => String(m.id)),
      membersDetail: membersWithoutLeader,
      leaderDetail: leaderData,
      correoLider: leaderData?.correo || "Sin correo",
      logo: team.logo || "",
      presupuesto: team.presupuesto ?? 100000,
      progreso: team.progreso ?? 45,
      original: team,
    };
  };

  const handleGetTeams = async () => {
    try {
      setLoading(true);
      const response = await getTeams();
      const teamList = extractList(response);

      const enrichedTeams = await Promise.all(
        teamList.map(async (team) => {
          try {
            const teamId = team.idEquipo || team.id;
            const membersResponse = await getTeamMembers(teamId);
            const members = extractList(membersResponse);
            return normalizeTeam(team, members);
          } catch (err) {
            console.error("Error obteniendo integrantes:", err);
            return buildFallbackTeam(team);
          }
        })
      );

      setTeams(enrichedTeams);
    } catch (error) {
      console.error("Error al obtener equipos:", error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAvailableUsers = async () => {
    try {
      const response = await getAvailableUsersForTeam();
      const list = extractList(response);
      setUsuariosDisponibles(list.map(normalizeUser));
    } catch (error) {
      console.error("Error cargando usuarios disponibles:", error);
      setUsuariosDisponibles([]);
    }
  };

  const handleGetProjects = async () => {
    try {
      const response = await getAvailableProjectsForTeam();
      const list = extractList(response);
      setProyectos(
        list.map((p) => ({
          id: String(p.idProyecto || p.id || ""),
          nombre: p.nombreProyecto || p.nombre || "Sin nombre",
        }))
      );
    } catch (error) {
      console.error("Error cargando proyectos disponibles:", error);
      setProyectos([]);
    }
  };

  useEffect(() => {
    handleGetTeams();
    handleGetProjects();
    handleGetAvailableUsers();
  }, []);

  const filteredTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) =>
      [t.nombre, t.lider, t.proyecto].some((v) =>
        (v || "").toLowerCase().includes(q)
      )
    );
  }, [query, teams]);

  const handleView = async (team) => {
    try {
      const teamResponse = await getTeamById(team.id);
      const teamData = teamResponse?.data || teamResponse;
      const membersResponse = await getTeamMembers(team.id);
      const integrantes = extractList(membersResponse);
      setSelectedTeam(normalizeTeam(teamData, integrantes));
      setShowViewModal(true);
    } catch (error) {
      console.error("Error al obtener detalle del equipo:", error);
    }
  };

  const handleEdit = async (team) => {
    try {
      const teamResponse = await getTeamById(team.id);
      const teamData = teamResponse?.data || teamResponse;
      const membersResponse = await getTeamMembers(team.id);
      const integrantes = extractList(membersResponse);
      setSelectedTeam(normalizeTeam(teamData, integrantes));
      setShowEditModal(true);
    } catch (error) {
      console.error("Error al obtener detalle para editar:", error);
    }
  };

  const handleDeleteOpen = (team) => {
    setSelectedTeam(team);
    setShowDeleteModal(true);
  };

  const handleCreateTeam = async (formData) => {
    try {
      setSubmitting(true);

      const logoFinal =
        formData.logo && formData.logo.startsWith("data:image")
          ? ""
          : formData.logo || "";

      const payload = {
        nombreEquipo: formData.nombre,
        idProyecto: formData.proyectoId ? Number(formData.proyectoId) : null,
        idLider: Number(formData.liderId),
        integrantesIds: (formData.miembrosIds || []).map((id) => Number(id)),
        logo: logoFinal,
      };

      console.log("PAYLOAD CREAR EQUIPO:", payload);

      const response = await createTeam(payload);
      console.log("RESPUESTA CREAR EQUIPO:", response);

      setShowCreateModal(false);
      await Promise.all([
        handleGetTeams(),
        handleGetAvailableUsers(),
        handleGetProjects(),
      ]);
      setShowCreatedSuccess(true);
    } catch (error) {
      console.error("ERROR COMPLETO AL CREAR EQUIPO:", error);
      console.error("STATUS:", error?.response?.status);
      console.error("DATA:", error?.response?.data);
      console.error("HEADERS:", error?.response?.headers);

      const rd = error?.response?.data;

      alert(
        `Status: ${error?.response?.status || "sin status"}\n` +
          `Mensaje: ${
            rd?.message ||
            rd?.mensaje ||
            rd?.error ||
            JSON.stringify(rd) ||
            error.message ||
            "Error desconocido"
          }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (formData) => {
    try {
      if (!selectedTeam?.id) return;
      setSubmitting(true);

      const payload = {
        idEquipo: Number(selectedTeam.id),
        nombreEquipo: formData.nombre,
        descripcion:
          formData.descripcion || selectedTeam.original?.descripcion || "",
        logo: formData.logo || "",
        estatus: selectedTeam.original?.estatus || "ACTIVO",
        lider: formData.liderId
          ? { idUsuario: Number(formData.liderId) }
          : null,
        proyecto: formData.proyectoId
          ? { idProyecto: Number(formData.proyectoId) }
          : null,
        miembros: (formData.miembrosIds || []).map((id) => ({
          idUsuario: Number(id),
        })),
      };

      await updateTeam(selectedTeam.id, payload);
      setShowEditModal(false);
      await Promise.all([
        handleGetTeams(),
        handleGetAvailableUsers(),
        handleGetProjects(),
      ]);
      setShowEditedSuccess(true);
    } catch (error) {
      console.error("Error al editar equipo:", error);
      const rd = error?.response?.data;
      alert(
        rd?.message ||
          rd?.mensaje ||
          JSON.stringify(rd) ||
          "No se pudo actualizar el equipo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedTeam?.id) return;
      setSubmitting(true);
      await deleteTeam(selectedTeam.id);
      setShowDeleteModal(false);
      await Promise.all([
        handleGetTeams(),
        handleGetAvailableUsers(),
        handleGetProjects(),
      ]);
      setShowDeletedSuccess(true);
    } catch (error) {
      console.error("Error al eliminar equipo:", error);
      alert(error?.response?.data?.message || "No se pudo eliminar el equipo.");
    } finally {
      setSubmitting(false);
    }
  };

  const usuariosDisponiblesParaCrear = useMemo(
    () => [...usuariosDisponibles].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [usuariosDisponibles]
  );

  const usuariosDisponiblesParaEditar = useMemo(() => {
    if (!selectedTeam) return usuariosDisponiblesParaCrear;

    const actuales = [];

    if (selectedTeam.leaderDetail?.id) {
      actuales.push({
        id: String(selectedTeam.leaderDetail.id),
        nombre: selectedTeam.leaderDetail.nombre,
        correo: selectedTeam.leaderDetail.correo || "",
        username: selectedTeam.leaderDetail.username || "",
        rol: getRolSafe(selectedTeam.leaderDetail.rol),
      });
    }

    selectedTeam.membersDetail.forEach((m) => {
      actuales.push({
        id: String(m.id),
        nombre: m.nombre,
        correo: m.correo || "",
        username: m.username || "",
        rol: getRolSafe(m.rol),
      });
    });

    const map = new Map();

    [...actuales, ...usuariosDisponibles].forEach((u) => {
      if (u?.id) {
        map.set(String(u.id), {
          id: String(u.id),
          nombre: u.nombre || "Sin nombre",
          correo: u.correo || "",
          username: u.username || "",
          rol: getRolSafe(u.rol),
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [selectedTeam, usuariosDisponibles, usuariosDisponiblesParaCrear]);

  const proyectosDisponiblesParaEditar = useMemo(() => {
    if (!selectedTeam) return proyectos;

    const map = new Map();

    if (selectedTeam.proyectoId) {
      const actual = {
        id: String(selectedTeam.proyectoId),
        nombre: selectedTeam.proyecto || "Sin nombre",
      };
      map.set(String(actual.id), actual);
    }

    proyectos.forEach((p) => map.set(String(p.id), p));

    return Array.from(map.values());
  }, [selectedTeam, proyectos]);

  return (
    <div>
      <h2>
        <i className="bi bi-people-fill me-2"></i>
        Equipos
      </h2>

      <section className="mt-4 d-flex align-items-center">
        <div className="input-group me-auto" style={{ width: 500 }}>
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="search"
            className="form-control"
            placeholder="Buscar equipos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          className="btn btn-success"
          type="button"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Crear equipo
        </button>
      </section>

      <section className="mt-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="teams-table-head">
              <tr>
                <th>Equipos</th>
                <th>Líder</th>
                <th>Miembros</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Cargando equipos...
                  </td>
                </tr>
              ) : filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No hay resultados.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team, index) => (
                  <TeamRow
                    key={team.id || index}
                    team={team}
                    onEdit={handleEdit}
                    onDelete={handleDeleteOpen}
                    onView={handleView}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showCreateModal && (
        <CreateTeam
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTeam}
          submitting={submitting}
          proyectos={proyectos}
          miembrosDisponibles={usuariosDisponiblesParaCrear}
        />
      )}

      {showViewModal && selectedTeam && (
        <ViewTeam team={selectedTeam} onClose={() => setShowViewModal(false)} />
      )}

      {showEditModal && selectedTeam && (
        <EditTeam
          team={selectedTeam}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          submitting={submitting}
          proyectos={proyectosDisponiblesParaEditar}
          miembrosDisponibles={usuariosDisponiblesParaEditar}
        />
      )}

      {showDeleteModal && selectedTeam && (
        <DeleteTeam
          team={selectedTeam}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleConfirmDelete}
          submitting={submitting}
        />
      )}

      {showCreatedSuccess && (
        <SuccessModal
          title="Creado exitosamente"
          message="Los cambios se han guardado correctamente en el sistema"
          onClose={() => setShowCreatedSuccess(false)}
        />
      )}

      {showEditedSuccess && (
        <SuccessModal
          title="Guardado exitosamente"
          message="Los cambios se han guardado correctamente en el sistema"
          onClose={() => setShowEditedSuccess(false)}
        />
      )}

      {showDeletedSuccess && (
        <SuccessModal
          title="Eliminado exitosamente"
          message="El registro ha sido eliminado correctamente del sistema"
          onClose={() => setShowDeletedSuccess(false)}
        />
      )}
    </div>
  );
}