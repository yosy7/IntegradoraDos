import { useMemo, useState } from "react";

export default function CreateTeam({
  onClose,
  onCreate,
  submitting,
  proyectos = [],
  miembrosDisponibles = [],
}) {
  const [nombre, setNombre] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [liderId, setLiderId] = useState("");
  const [miembroSeleccionado, setMiembroSeleccionado] = useState("");
  const [miembrosIds, setMiembrosIds] = useState([]);
  const [logo, setLogo] = useState("");

  const lideresDisponibles = useMemo(() => {
    return [...miembrosDisponibles].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || "")
    );
  }, [miembrosDisponibles]);

  const integrantesDisponibles = useMemo(() => {
    return miembrosDisponibles
      .filter((u) => {
        const id = String(u.id);
        if (id === String(liderId)) return false;
        if (miembrosIds.includes(id)) return false;
        return true;
      })
      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  }, [miembrosDisponibles, liderId, miembrosIds]);

  const integrantesSeleccionados = useMemo(() => {
    return miembrosDisponibles.filter((u) =>
      miembrosIds.includes(String(u.id))
    );
  }, [miembrosDisponibles, miembrosIds]);

  const handleAgregarMiembro = (id) => {
    const value = String(id);
    if (!value) return;

    if (value === String(liderId)) {
      setMiembroSeleccionado("");
      return;
    }

    if (!miembrosIds.includes(value)) {
      setMiembrosIds((prev) => [...prev, value]);
    }

    setMiembroSeleccionado("");
  };

  const handleEliminarMiembro = (id) => {
    const value = String(id);
    setMiembrosIds((prev) => prev.filter((item) => item !== value));
  };

  const handleChangeLider = (value) => {
    setLiderId(value);

    if (value) {
      setMiembrosIds((prev) => prev.filter((id) => id !== String(value)));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim() || !liderId) {
      alert("Completa los campos obligatorios.");
      return;
    }

    onCreate({
      nombre: nombre.trim(),
      proyectoId: proyectoId ? String(proyectoId) : "",
      liderId: String(liderId),
      miembrosIds: miembrosIds.map(String),
      logo: logo.trim(),
    });
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title">Crear equipo</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body pt-2 px-4">
              <div className="mb-4">
                <label className="form-label fw-semibold">Nombre del equipo*</label>
                <input
                  type="text"
                  className="form-control rounded-pill py-2 px-3"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Proyecto</label>
                <select
                  className="form-select rounded-pill py-2 px-3"
                  value={proyectoId}
                  onChange={(e) => setProyectoId(e.target.value)}
                >
                  <option value="">Sin proyecto</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Líder*</label>
                <select
                  className="form-select rounded-pill py-2 px-3"
                  value={liderId}
                  onChange={(e) => handleChangeLider(e.target.value)}
                >
                  <option value="">Selecciona un líder</option>
                  {lideresDisponibles.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold">Integrantes</label>
                <select
                  className="form-select rounded-pill py-2 px-3"
                  value={miembroSeleccionado}
                  onChange={(e) => {
                    setMiembroSeleccionado(e.target.value);
                    handleAgregarMiembro(e.target.value);
                  }}
                >
                  <option value="">Seleccionar miembro</option>
                  {integrantesDisponibles.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {integrantesSeleccionados.length > 0 && (
                <div className="mb-4 d-flex flex-wrap gap-2">
                  {integrantesSeleccionados.map((usuario) => (
                    <span
                      key={usuario.id}
                      className="d-inline-flex align-items-center px-3 py-2 rounded-pill text-white"
                      style={{ backgroundColor: "#2f7774", fontSize: "0.95rem" }}
                    >
                      {usuario.nombre}
                      <button
                        type="button"
                        className="btn btn-sm border-0 text-white ms-2 p-0"
                        style={{ lineHeight: 1, fontSize: "1rem" }}
                        onClick={() => handleEliminarMiembro(usuario.id)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">Logo</label>
                <input
                  type="text"
                  className="form-control rounded-pill py-2 px-3"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="URL"
                />
              </div>
            </div>

            <div className="modal-footer border-0 pt-0 px-4 pb-4">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-3"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn btn-success rounded-3"
                disabled={submitting}
              >
                {submitting ? "Guardando..." : "Crear equipo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}