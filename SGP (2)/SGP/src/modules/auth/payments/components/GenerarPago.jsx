import { useEffect, useState, useMemo } from "react";
import { getProjects } from "../../../../api/projectService";
import { getPaymentsByProyecto } from "../../../../api/paymentService";

const calcularPeriodo = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = hoy.getDate();
  const ultimoDia = new Date(year, hoy.getMonth() + 1, 0).getDate();
  const sufijo = dia === 15 ? "15" : String(ultimoDia);
  return `${year}-${month}-${sufijo}`;
};

export default function GenerarPagoModal({ onGenerar, processing = false }) {
  const [proyectos, setProyectos] = useState([]);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [yaGenerados, setYaGenerados] = useState({});
  const [loading, setLoading] = useState(false);

  const periodo = calcularPeriodo();

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await getProjects();
        const lista = Array.isArray(res?.data) ? res.data : [];

        // Solo proyectos activos con equipo asignado (sin equipo no pueden tener integrantes)
        const elegibles = lista.filter(
          (p) =>
            p.estado?.toUpperCase() !== "CANCELADO" &&
            p.estado?.toUpperCase() !== "FINALIZADO" &&
            p.equipo?.idEquipo
        );

        setProyectos(elegibles);

        // Verificar cuáles ya tienen pagos generados para el periodo actual
        const estado = {};
        await Promise.all(
          elegibles.map(async (p) => {
            try {
              const pagosRes = await getPaymentsByProyecto(p.idProyecto);
              const pagos = Array.isArray(pagosRes?.data) ? pagosRes.data : [];
              estado[p.idProyecto] = pagos.some((pago) => pago.periodo === periodo);
            } catch {
              estado[p.idProyecto] = false;
            }
          })
        );

        setYaGenerados(estado);
      } catch {
        setProyectos([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const disponibles = useMemo(
    () => proyectos.filter((p) => !yaGenerados[p.idProyecto]),
    [proyectos, yaGenerados]
  );

  const yaListos = useMemo(
    () => proyectos.filter((p) => yaGenerados[p.idProyecto]),
    [proyectos, yaGenerados]
  );

  const toggle = (id) => {
    setSeleccionados((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleTodos = () => {
    setSeleccionados(
      seleccionados.size === disponibles.length
        ? new Set()
        : new Set(disponibles.map((p) => p.idProyecto))
    );
  };

  const reset = () => setSeleccionados(new Set());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (seleccionados.size === 0) {
      alert("Selecciona al menos un proyecto.");
      return;
    }
    onGenerar({ proyectosIds: Array.from(seleccionados), periodo });
  };

  const todosSeleccionados =
    disponibles.length > 0 && seleccionados.size === disponibles.length;

  return (
    <div
      className="modal fade project-modal"
      id="generarPagoModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4">
          <div className="modal-body p-4 p-md-5">

            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="modal-title-custom m-0">
                <i className="bi bi-calendar-plus me-3"></i>
                Generar pagos del periodo
              </h2>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                disabled={processing}
                onClick={reset}
              ></button>
            </div>

            {/* Info periodo */}
            <div
              className="rounded-4 p-3 mb-4"
              style={{ backgroundColor: "#f0f7ff", border: "1px solid #b6d4fe" }}
            >
              <p className="mb-1 fw-semibold" style={{ color: "#0a58ca" }}>
                <i className="bi bi-info-circle me-2"></i>
                Periodo que se generará
              </p>
              <p className="mb-0 fs-5 fw-bold" style={{ color: "#084298" }}>
                {periodo}
              </p>
              <p className="mb-0 mt-1 text-muted small">
                Se crearán pagos <strong>PENDIENTE</strong> (monto $0) para todos
                los integrantes activos de cada proyecto seleccionado. Los montos
                se asignan al realizar cada pago.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {loading ? (
                <p className="text-center text-muted py-3">
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Verificando proyectos...
                </p>
              ) : (
                <>
                  {/* Proyectos disponibles */}
                  {disponibles.length > 0 ? (
                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <label className="form-label fw-semibold mb-0">
                          Selecciona los proyectos
                        </label>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-decoration-none"
                          onClick={toggleTodos}
                          disabled={processing}
                        >
                          {todosSeleccionados ? "Deseleccionar todos" : "Seleccionar todos"}
                        </button>
                      </div>

                      <div
                        className="border rounded-3 overflow-hidden"
                        style={{ maxHeight: "280px", overflowY: "auto" }}
                      >
                        {disponibles.map((p, i) => {
                          const checked = seleccionados.has(p.idProyecto);
                          return (
                            <label
                              key={p.idProyecto}
                              className="d-flex align-items-center gap-3 px-3 py-2"
                              style={{
                                backgroundColor: checked ? "#f0fff4" : i % 2 === 0 ? "#fff" : "#fafafa",
                                borderBottom: i < disponibles.length - 1 ? "1px solid #f0f0f0" : "none",
                                cursor: "pointer",
                                transition: "background 0.15s",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="form-check-input m-0 flex-shrink-0"
                                checked={checked}
                                onChange={() => toggle(p.idProyecto)}
                                disabled={processing}
                                style={{ width: "18px", height: "18px" }}
                              />
                              <div className="flex-grow-1">
                                <span className="fw-semibold" style={{ fontSize: "0.92rem" }}>
                                  {p.nombre}
                                </span>
                                {p.equipo?.nombreEquipo && (
                                  <span className="ms-2 text-muted" style={{ fontSize: "0.8rem" }}>
                                    {p.equipo.nombreEquipo}
                                  </span>
                                )}
                              </div>
                              {checked && (
                                <i className="bi bi-check-circle-fill text-success"></i>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      {seleccionados.size > 0 && (
                        <p className="text-muted small mt-2 mb-0">
                          {seleccionados.size} proyecto(s) seleccionado(s)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div
                      className="rounded-3 p-3 mb-3 text-center"
                      style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}
                    >
                      <i className="bi bi-check-all text-success fs-4 d-block mb-1"></i>
                      <p className="mb-0 text-muted small">
                        Todos los proyectos ya tienen pagos generados para el periodo{" "}
                        <strong>{periodo}</strong>.
                      </p>
                    </div>
                  )}

                  {/* Ya generados */}
                  {yaListos.length > 0 && (
                    <div className="mb-3">
                      <p className="text-muted small fw-semibold mb-2">
                        <i className="bi bi-check-circle-fill text-success me-1"></i>
                        Ya generados para este periodo:
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {yaListos.map((p) => (
                          <span
                            key={p.idProyecto}
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: "#d1e7dd",
                              color: "#0a3622",
                              fontSize: "0.78rem",
                              fontWeight: 500,
                            }}
                          >
                            <i className="bi bi-check me-1"></i>
                            {p.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  data-bs-dismiss="modal"
                  disabled={processing}
                  onClick={reset}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={processing || seleccionados.size === 0 || loading}
                >
                  {processing
                    ? "Generando..."
                    : seleccionados.size === 0
                    ? "Generar pagos"
                    : `Generar para ${seleccionados.size} proyecto(s)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}