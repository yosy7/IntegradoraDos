import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import UsersTabs from "./components/UsersTabs";
import LeadersTable from "./components/LeadersTable";
import MembersTable from "./components/MembersTable";
import CreateMemberModal from "./components/CreateMember";
import EditUserModal from "./components/EditUserModal";
import ViewUserModal from "./components/ViewUserModal";
import DeleteUserModal from "./components/DeleteUserModal";
import { getUsers } from "../../../api/userService";
import { getTeams, getTeamMembers } from "../../../api/teamService";

export default function Users() {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "leaders"
  );
  const [query, setQuery] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const getRoleName = (user) => {
    if (!user) return "";

    if (typeof user.rol === "string") return user.rol;
    if (typeof user.role === "string") return user.role;
    if (typeof user.nombreRol === "string") return user.nombreRol;

    if (user.rol && typeof user.rol === "object") {
      return user.rol.nombre || user.rol.nombreRol || "";
    }

    if (user.role && typeof user.role === "object") {
      return user.role.nombre || user.role.nombreRol || "";
    }

    return "";
  };

  const extractList = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const handleGetUsers = async () => {
    try {
      setLoading(true);

      const [usersResponse, teamsResponse] = await Promise.all([
        getUsers(),
        getTeams(),
      ]);

      const rawUsers = extractList(usersResponse);
      const rawTeams = extractList(teamsResponse);

      const teamMapByUserId = new Map();

      await Promise.all(
        rawTeams.map(async (team) => {
          try {
            const teamId = team.idEquipo || team.id;
            const teamName = team.nombreEquipo || team.nombre || "Sin equipo";

            const lider =
              team.lider || team.usuarioLider || team.encargado || null;

            if (lider?.idUsuario || lider?.id) {
              teamMapByUserId.set(String(lider.idUsuario || lider.id), teamName);
            }

            const membersResponse = await getTeamMembers(teamId);
            const teamMembers = extractList(membersResponse);

            teamMembers.forEach((m) => {
              const id = String(m.idUsuario || m.id || "");
              if (id) teamMapByUserId.set(id, teamName);
            });
          } catch (err) {
            console.error("Error obteniendo integrantes:", err);
          }
        })
      );

      const formattedUsers = rawUsers.map((user) => {
        const fullName = [user.nombre, user.apellidoPaterno, user.apellidoMaterno]
          .filter(Boolean)
          .join(" ")
          .trim();

        const userId = String(user.idUsuario || user.id || "");
        const roleName = getRoleName(user);

        return {
          id: user.idUsuario || user.id,
          name: fullName || user.nombreCompleto || "Sin nombre",
          firstName: user.nombre || "",
          lastNameP: user.apellidoPaterno || "",
          lastNameM: user.apellidoMaterno || "",
          username: user.username || "Sin usuario",
          email: user.correo || user.email || "",
          salary: user.salario ?? "",
          entryDate: user.fechaRegistro || "",
          role: roleName,
          status: user.estatus || "Sin estatus",
          team: teamMapByUserId.get(userId) || "Sin equipo",
        };
      });

      const activeUsers = formattedUsers.filter(
        (u) => (u.status || "").toUpperCase() !== "INACTIVO"
      );

      const leadersList = activeUsers.filter((u) =>
        (u.role || "").toLowerCase().includes("lider")
      );

      const membersList = activeUsers.filter(
        (u) => !(u.role || "").toLowerCase().includes("lider")
      );

      setLeaders(leadersList);
      setMembers(membersList);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setLeaders([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetUsers();
  }, []);

  const handleEdit = (user) => setSelectedUser(user);
  const handleView = (user) => setSelectedUser(user);

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const filteredLeaders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leaders;
    return leaders.filter((u) =>
      [u.name, u.username, u.team, u.role].some((v) =>
        (v ?? "").toLowerCase().includes(q)
      )
    );
  }, [query, leaders]);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((u) =>
      [u.name, u.username, u.team, u.role].some((v) =>
        (v ?? "").toLowerCase().includes(q)
      )
    );
  }, [query, members]);

  const isLeaders = activeTab === "leaders";

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, query]);

  const currentData = isLeaders ? filteredLeaders : filteredMembers;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = currentData.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div>
      <h2>
        <i className="bi bi-person-fill"></i>&nbsp;Usuarios
      </h2>

      <section className="mt-4 d-flex align-items-center gap-3">
        <UsersTabs activeTab={activeTab} onChange={setActiveTab} />

        {!isLeaders && (
          <div className="ms-auto">
            <button
              className="btn btn-success"
              type="button"
              data-bs-toggle="modal"
              data-bs-target="#createMemberModal"
            >
              <i className="bi bi-plus-lg me-2"></i>
              Crear Usuario
            </button>
          </div>
        )}
      </section>

      <section className="mt-3 d-flex align-items-center">
        <div className="input-group" style={{ width: 500 }}>
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="search"
            className="form-control"
            placeholder={isLeaders ? "Buscar líderes..." : "Buscar integrantes..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      <section className="mt-4">
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : isLeaders ? (
          <LeadersTable
            data={paginatedData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <MembersTable
            data={paginatedData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}
      </section>

      {!loading && totalPages > 1 && (
        <nav aria-label="Page navigation example" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => goToPage(currentPage - 1)}
                aria-label="Previous"
                type="button"
              >
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>

            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index}
                className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(index + 1)}
                  type="button"
                >
                  {index + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => goToPage(currentPage + 1)}
                aria-label="Next"
                type="button"
              >
                <span aria-hidden="true">&raquo;</span>
              </button>
            </li>
          </ul>
        </nav>
      )}

      <CreateMemberModal onSaved={handleGetUsers} />

      <EditUserModal
        modalId="editUserModal"
        user={selectedUser}
        onSaved={handleGetUsers}
        showRole={isLeaders}
      />

      <ViewUserModal
        modalId="viewUserModal"
        user={selectedUser}
        showRole={isLeaders}
      />

      {showDeleteModal && (
        <DeleteUserModal
          user={selectedUser}
          onDeleted={handleGetUsers}
          onClose={handleCloseDeleteModal}
        />
      )}
    </div>
  );
}