export default function ViewTeam({ team, onClose }) {
  const progress = team?.progreso ?? 45;
  const presupuesto = team?.presupuesto ?? 100000;

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-materials-modal project-modal" style={{ maxWidth: "1100px" }}>
        <div className="d-flex align-items-center gap-4 mb-4">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 border bg-light"
            style={{ width: "120px", height: "80px" }}
          >
            {team?.logo ? (
              <img
                src={team.logo}
                alt="logo equipo"
                className="img-fluid rounded-3"
                style={{ maxHeight: "100%", objectFit: "cover" }}
              />
            ) : (
              <span className="text-secondary">Team Logo</span>
            )}
          </div>

          <h2 className="modal-title-custom m-0">{team?.nombre || "Equipo"}</h2>
        </div>

        <div className="border rounded-4 p-4 mb-4">
          <div className="row g-4 align-items-center">
            <div className="col-md-5">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: "46px", height: "46px", backgroundColor: "#2f7d78" }}
                >
                  <i className="bi bi-person-fill"></i>
                </div>

                <div>
                  <div className="text-secondary small">Líder del Equipo</div>
                  <div className="fw-bold fs-3" style={{ color: "#27445d" }}>
                    {team?.lider || "Sin líder"}
                  </div>
                  <div className="small text-secondary">
                    {team?.correoLider || "Sin correo"}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 border-start">
              <div className="ps-md-4">
                <div className="text-secondary small mb-2">Presupuesto</div>
                <div className="fw-bold fs-1" style={{ color: "#27445d" }}>
                  ${presupuesto.toLocaleString("es-MX")}
                </div>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div className="progress-bar" style={{ width: "65%", backgroundColor: "#2f7d78" }}></div>
                </div>
                <div className="small text-secondary mt-2">65% utilizado</div>
              </div>
            </div>

            <div className="col-md-3 border-start">
              <div className="ps-md-4">
                <div className="text-secondary small mb-2">Progreso</div>
                <div className="fw-bold fs-1" style={{ color: "#27445d" }}>
                  {progress}%
                </div>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${progress}%`, backgroundColor: "#2f7d78" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="fw-bold mb-3" style={{ color: "#27445d", fontSize: "2rem" }}>
          Miembros del Equipo
        </h3>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="teams-table-head">
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Nombre de usuario</th>
              </tr>
            </thead>
            <tbody>
              {team?.membersDetail?.length > 0 ? (
                team.membersDetail.map((member) => (
                  <tr key={member.id}>
                    <td>{member.nombre}</td>
                    <td>{member.correo}</td>
                    <td>{member.username}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No hay miembros registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button className="project-btn-save" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}