import { Outlet } from "react-router-dom";
import CustomSidebar from "../components/CustomSidebar";

export default function AuthLayout({ setSession }) {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <CustomSidebar setSession={setSession} />

      <div className="flex-grow-1 d-flex flex-column">
        <header
          style={{
            height: "85px",
            background: "linear-gradient(90deg, #12495c, #1d6b72)",
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "0 35px",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Gestión de proyectos
        </header>

        <main style={{ flex: 1, padding: "30px", backgroundColor: "#f5f5f5" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}