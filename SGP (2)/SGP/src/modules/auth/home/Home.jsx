import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, getTeams, getProjects } from "../../../api/homeService";
import "./home.css";
import SummaryCard from "./components/SummaryCard";
import ProjectCard from "./components/ProjectCard";
import ProjectFilters from "./components/ProjectFilters";

export default function Home() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");

  const rol = (sessionStorage.getItem("rol") || "").toUpperCase();
  const isAdmin = rol.includes("ADMIN");

  const extractList = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const handleLoadDashboard = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        const [usersRes, teamsRes, projectsRes] = await Promise.all([
          getUsers(),
          getTeams(),
          getProjects(),
        ]);
        setUsers(extractList(usersRes));
        setTeams(extractList(teamsRes));
        setProjects(extractList(projectsRes));
      } else {
        const [teamsRes, projectsRes] = await Promise.all([
          getTeams(),
          getProjects(),
        ]);
        setUsers([]);
        setTeams(extractList(teamsRes));
        setProjects(extractList(projectsRes));
      }
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
      setUsers([]);
      setTeams([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadDashboard();
  }, []);

  const leadersCount = useMemo(() => {
    const uniqueLeaders = new Set();

    teams.forEach((team) => {
      const lider = team?.lider || team?.usuarioLider || team?.leader;
      const liderId = lider?.idUsuario || lider?.id;
      if (liderId != null) uniqueLeaders.add(String(liderId));
    });

    if (uniqueLeaders.size > 0) return uniqueLeaders.size;

    users.forEach((user) => {
      const rolNombre =
        typeof user?.rol === "string"
          ? user.rol
          : user?.rol?.nombre || "";

      const normalizado = rolNombre
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      if (normalizado.includes("lider") || normalizado.includes("leader")) {
        const uid = user?.idUsuario || user?.id;
        if (uid != null) uniqueLeaders.add(String(uid));
      }
    });

    return uniqueLeaders.size;
  }, [users, teams]);

  const formattedProjects = useMemo(() => {
    return projects.map((p) => ({
      id: p?.idProyecto || p?.id || Math.random(),
      name: p?.nombre || p?.nombreProyecto || "Sin nombre",
      team: p?.equipo?.nombreEquipo || p?.equipo?.nombre || "Sin equipo",
      budget: Number(p?.presupuestoTotal ?? p?.presupuesto ?? 0) || 0,
      progress: Number(p?.porcentajeAvance ?? p?.avance ?? 0) || 0,
      status:
        String(p?.estado || "").toLowerCase().includes("riesgo") ||
        Number(p?.porcentajeAvance ?? p?.avance ?? 0) < 40
          ? "riesgo"
          : "estable",
      budgetFormatted: Number(
        p?.presupuestoTotal ?? p?.presupuesto ?? 0
      ).toLocaleString("es-MX", { style: "currency", currency: "MXN" }),
    }));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return formattedProjects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.team.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        selectedStatus === "todos" || p.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [formattedProjects, search, selectedStatus]);

  return (
    <div className="home-page">
      <div className="home-header">
        <h2>
          <i className="bi bi-house-fill"></i> Inicio
        </h2>
      </div>

      <div className="summary-grid">
        <SummaryCard
          icon={<i className="bi bi-person-fill"></i>}
          title="Líderes"
          value={loading ? "..." : leadersCount}
          onClick={() =>
            navigate("/auth/users", {
              state: { activeTab: "leaders" },
            })
          }
        />

        <SummaryCard
          icon={<i className="bi bi-people-fill"></i>}
          title="Equipos"
          value={loading ? "..." : teams.length}
          onClick={() => navigate("/auth/teams")}
        />

        <SummaryCard
          icon={<i className="bi bi-folder-fill"></i>}
          title="Proyectos"
          value={loading ? "..." : projects.length}
          variant="projects"
          onClick={() => navigate("/auth/projects")}
        />
      </div>

      <section className="projects-section">
        <h3>Proyectos activos</h3>

        <ProjectFilters
          search={search}
          setSearch={setSearch}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        {loading ? (
          <div className="empty-state">Cargando proyectos...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">No hay proyectos para mostrar.</div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}