import { NavLink, useNavigate } from "react-router-dom";

export default function CustomSidebar({ setSession }) {
  const navigate = useNavigate();

  const rol = (sessionStorage.getItem("rol") || "").toUpperCase();

  const isAdmin = rol.includes("ADMIN") || rol.includes("SUPERADMIN");
  const isLeader = rol.includes("LIDER");
  const isIntegrante = rol.includes("INTEGRANTE") || rol.includes("USUARIO");

  const closeSession = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("rol");
    sessionStorage.removeItem("nombre");
    sessionStorage.removeItem("idUsuario");
    sessionStorage.removeItem("username");
    setSession(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `text-start text-white btn rounded-3 mb-3 w-100 py-3 ${
      isActive ? "bg-white bg-opacity-25" : ""
    }`;

  return (
    <div
      className="col-2 bg-sidebar shadow p-3 d-flex flex-column"
      style={{ minHeight: "100vh" }}
    >
      <h5 className="mb-4">
        <i className="fs-3 bi bi-shop"></i>&nbsp; Utez
      </h5>

      <div style={{ margin: "0 -0.5rem", flex: 1 }}>
        {/* Inicio — visible para todos */}
        <NavLink
          to="/home"
          className={linkClass}
          style={{ paddingLeft: "1.25rem" }}
        >
          <i className="bi bi-house-door-fill"></i>&nbsp;Inicio
        </NavLink>
        <br />

        {/* ADMIN */}
        {isAdmin && (
          <>
            <NavLink
              to="/teams"
              className={linkClass}
              style={{ paddingLeft: "1.25rem" }}
            >
              <i className="bi bi-people-fill"></i>&nbsp;Equipos
            </NavLink>
            <br />

            <NavLink
              to="/projects"
              className={linkClass}
              style={{ paddingLeft: "1.25rem" }}
            >
              <i className="bi bi-folder-fill"></i>&nbsp;Proyectos
            </NavLink>
            <br />

            <NavLink
              to="/payments"
              className={linkClass}
              style={{ paddingLeft: "1.25rem" }}
            >
              <i className="bi bi-cash-stack"></i>&nbsp;Pagos
            </NavLink>
            <br />

            <NavLink
              to="/users"
              className={linkClass}
              style={{ paddingLeft: "1.25rem" }}
            >
              <i className="bi bi-person-fill"></i>&nbsp;Usuarios
            </NavLink>
            <br />
          </>
        )}

        {/* LÍDER */}
        {isLeader && !isAdmin && (
          <>
            <NavLink
              to="/tasks"
              className={linkClass}
              style={{ paddingLeft: "1.25rem" }}
            >
              <i className="bi bi-list-task"></i>&nbsp;Tareas
            </NavLink>
            <br />

            <NavLink
              to="/my-tasks"
              className={linkClass}
              style={{ paddingLeft: "1.25rem" }}
            >
              <i className="bi bi-check2-square"></i>&nbsp;Mis tareas
            </NavLink>
            <br />
          </>
        )}

        {/* INTEGRANTE */}
        {isIntegrante && !isAdmin && !isLeader && (
          <>
            <NavLink
              to="/mis-tareas"
              className={linkClass}
              style={{ paddingLeft: "1.25rem" }}
            >
              <i className="bi bi-check2-square"></i>&nbsp;Mis tareas
            </NavLink>
            <br />
          </>
        )}
      </div>

      <button
        onClick={closeSession}
        className="text-start btn btn-outline-danger mt-auto"
      >
        <i className="bi bi-box-arrow-left"></i>&nbsp;Cerrar sesión
      </button>
    </div>
  );
}