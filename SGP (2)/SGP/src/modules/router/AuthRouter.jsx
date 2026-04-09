import { Navigate, Route, Routes } from "react-router-dom";
import Error404 from "../error/Error404";
import CustomSidebar from "../auth/components/CustomSidebar";


import Home from "../auth/home/Home";
import Projects from "../auth/projects/Project";
import Teams from "../auth/teams/Teams";
import Users from "../auth/users/Users";
import Payments from "../auth/payments/Payments";


import LeaderHome from "../auth/leader/LeaderHome";
import LeaderPayments from "../auth/leader/LeaderPayments";
import LeaderTasks from "../auth/leader/LeaderTasks";
import LeaderMyTasks from "../auth/leader/LeaderMyTasks";

const getRole = () => (sessionStorage.getItem("rol") || "").toUpperCase().trim();

const isAdmin      = (r) => r.includes("ADMIN");
const isLeader     = (r) => r.includes("LIDER") || r.includes("LÍDER");
const isIntegrante = (r) => r.includes("INTEGRANTE") || r.includes("USUARIO");

function ProtectedRoute({ allowAdmin = false, allowLeader = false, allowIntegrante = false, children }) {
  const role = getRole();

  const allowed =
    (allowAdmin      && isAdmin(role))      ||
    (allowLeader     && isLeader(role))     ||
    (allowIntegrante && isIntegrante(role));

  if (!allowed) {

    return role ? <Navigate to="/home" replace /> : <Navigate to="/" replace />;
  }

  return children;
}

function RoleHome() {
  const role = getRole();
  if (isAdmin(role))      return <Home />;
  if (isLeader(role))     return <LeaderHome />;
  if (isIntegrante(role)) return <IntegranteHome />;
  return <Home />;
}

// Vista básica para integrante mientras no tengas su página completa
function IntegranteHome() {
  return (
    <div className="p-4">
      <h4>👋 Bienvenido</h4>
      <p className="text-muted">Usa el menú para ver tus tareas asignadas.</p>
    </div>
  );
}

export default function AuthRouter({ setSession }) {
  return (
    <main className="row m-0" style={{ minHeight: "100vh" }}>
      <CustomSidebar setSession={setSession} />

      <div className="col-10 p-0 d-flex flex-column">
        <header
          className="text-white d-flex align-items-center px-4"
          style={{
            height: "86px",
            background: "linear-gradient(90deg, #12495c, #1d6b72)",
            fontSize: "2rem",
            fontWeight: "700",
          }}
        >
          Gestión de proyectos
        </header>

        <div className="p-5" style={{ backgroundColor: "#f5f5f5", flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<RoleHome />} />

            {/* ADMIN */}
            <Route path="/projects" element={<ProtectedRoute allowAdmin><Projects /></ProtectedRoute>} />
            <Route path="/teams"    element={<ProtectedRoute allowAdmin><Teams /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute allowAdmin><Payments /></ProtectedRoute>} />
            <Route path="/users"    element={<ProtectedRoute allowAdmin><Users /></ProtectedRoute>} />

            {/* LÍDER */}
            <Route path="/leader-payments" element={<ProtectedRoute allowLeader><LeaderPayments /></ProtectedRoute>} />
            <Route path="/tasks"           element={<ProtectedRoute allowLeader><LeaderTasks /></ProtectedRoute>} />
            <Route path="/my-tasks"        element={<ProtectedRoute allowLeader><LeaderMyTasks /></ProtectedRoute>} />

            {/* INTEGRANTE — cuando tengas su página, ponla aquí */}
            <Route path="/mis-tareas" element={<ProtectedRoute allowIntegrante><LeaderMyTasks /></ProtectedRoute>} />

            <Route path="*" element={<Error404 />} />
          </Routes>
        </div>
      </div>
    </main>
  );
}