import { useEffect, useMemo, useState } from "react";

export default function PagarPendientesModal({
  pagosPendientes = [],
  onPagar,
  formatMoney,
  processing = false,
}) {
  // Estado local: un objeto { [idPago]: { horas, tarifa, descripcion } }
  const [inputs, setInputs] = useState({});

  // Cuando cambia la lista de pendientes, inicializar los inputs vacíos
  useEffect(() => {
    const inicial = {};
    pagosPendientes.forEach((p) => {
      inicial[p.idPago] = {
        horas: p.horas && Number(p.horas) > 0 ? String(p.horas) : "",
        tarifa: p.tarifa && Number(p.tarifa) > 0 ? String(p.tarifa) : "",
        descripcion: p.descripcion ?? "",
      };
    });
    setInputs(inicial);
  }, [pagosPendientes]);

  const setField = (idPago, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [idPago]: { ...prev[idPago], [field]: value },
    }));
  };

  // Agrupar por proyecto para mostrar secciones
  const agrupadosPorProyecto = useMemo(() => {
    const grupos = {};
    pagosPendientes.forEach((p) => {
      const key = p.idProyecto ?? "sin-proyecto";
      const nombre = p.nombreProyecto ?? "Sin proyecto";
      if (!grupos[key]) grupos[key] = { nombre, pagos: [], idProyecto: p.idProyecto };
      grupos[key].pagos.push(p);
    });
    return Object.values(grupos);
  }, [pagosPendientes]);

  const calcularTotal = (idPago) => {
    const h = parseFloat(inputs[idPago]?.horas) || 0;
    const t = parseFloat(inputs[idPago]?.tarifa) || 0;
    return h * t;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar que al menos un pago tenga horas y tarifa > 0
    const validos = pagosPendientes.filter((p) => {
      const h = parseFloat(inputs[p.idPago]?.horas) || 0;
      const t = parseFloat(inputs[p.idPago]?.tarifa) || 0;
      return h > 0 && t > 0;
    });

    if (validos.length === 0) {
      alert(
        "Ingresa al menos horas y tarifa mayores a 0 para uno o más integrantes."
      );
      return;
    }

    // Agrupar por proyecto (el endpoint recibe todos los del mismo proyecto)
    // Si hay múltiples proyectos, hacemos un solo request con todo
    // El backend procesa cada pago de forma individual
    const dtoList = validos.map((p) => ({
      idPago: p.idPago,
      horas: parseFloat(inputs[p.idPago].horas),
      tarifa: parseFloat(inputs[p.idPago].tarifa),
      descripcion: inputs[p.idPago]?.descripcion ?? "",
    }));

    // Tomamos el primer idProyecto para el endpoint (el backend valida cada uno)
    // Si hay varios proyectos, el backend los maneja por separado
    const idProyecto = validos[0]?.idProyecto;

    onPagar({ idProyecto, dtoList });
  };

  if (pagosPendientes.length === 0) {
    return (
      <div
        className="modal fade project-modal"
        id="pagarPendientesModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4">
            <div className="modal-body p-4 text-center">
              <i className="bi bi-check-circle text-success fs-1 mb-3 d-block"></i>
              <p className="mb-0">No hay pagos pendientes en este momento.</p>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  data-bs-dismiss="modal"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal fade project-modal"
      id="pagarPendientesModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 rounded-4">
          <div className="modal-body p-4 p-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="modal-title-custom m-0">
                <i className="bi bi-cash-coin me-3"></i>
                Pagar pendientes
              </h2>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                disabled={processing}
              ></button>
            </div>

            <p className="text-muted mb-4">
              Ingresa las horas y tarifa de cada integrante. Los que queden en
              blanco se omitirán.
            </p>

            <form onSubmit={handleSubmit}>
              {agrupadosPorProyecto.map((grupo) => (
                <div key={grupo.idProyecto} className="mb-4">
                  {/* Encabezado del proyecto */}
                  <div
                    className="rounded-3 px-3 py-2 mb-3 d-flex align-items-center gap-2"
                    style={{
                      backgroundColor: "#f0f7ff",
                      borderLeft: "4px solid #0d6efd",
                    }}
                  >
                    <i className="bi bi-folder-fill text-primary"></i>
                    <span className="fw-semibold">{grupo.nombre}</span>
                    <span className="ms-auto text-muted small">
                      {grupo.pagos.length} pago(s) pendiente(s)
                    </span>
                  </div>

                  {/* Fila de encabezado */}
                  <div
                    className="row g-2 mb-1 px-2"
                    style={{ fontSize: "0.82rem", color: "#6c757d" }}
                  >
                    <div className="col-3">Integrante</div>
                    <div className="col-2">Periodo</div>
                    <div className="col-2">Horas *</div>
                    <div className="col-2">Tarifa/h ($) *</div>
                    <div className="col-2">Total calculado</div>
                    <div className="col-1"></div>
                  </div>

                  {/* Filas de integrantes */}
                  {grupo.pagos.map((pago) => {
                    const total = calcularTotal(pago.idPago);
                    const inp = inputs[pago.idPago] ?? {};
                    const valido =
                      parseFloat(inp.horas) > 0 && parseFloat(inp.tarifa) > 0;

                    return (
                      <div
                        key={pago.idPago}
                        className="row g-2 align-items-center mb-2 px-2 py-2 rounded-3"
                        style={{
                          backgroundColor: valido ? "#f0fff4" : "#fff",
                          border: "1px solid",
                          borderColor: valido ? "#b2dfdb" : "#dee2e6",
                          transition: "background 0.2s",
                        }}
                      >
                        {/* Nombre */}
                        <div className="col-3">
                          <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                            {[
                              pago.usuario?.nombre,
                              pago.usuario?.apellidoPaterno,
                              pago.usuario?.apellidoMaterno,
                            ]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </span>
                        </div>

                        {/* Periodo */}
                        <div className="col-2">
                          <span className="text-muted small">{pago.periodo ?? "—"}</span>
                        </div>

                        {/* Horas */}
                        <div className="col-2">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            className="form-control form-control-sm"
                            placeholder="Ej. 40"
                            value={inp.horas ?? ""}
                            onChange={(e) =>
                              setField(pago.idPago, "horas", e.target.value)
                            }
                            disabled={processing}
                          />
                        </div>

                        {/* Tarifa */}
                        <div className="col-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control form-control-sm"
                            placeholder="Ej. 150"
                            value={inp.tarifa ?? ""}
                            onChange={(e) =>
                              setField(pago.idPago, "tarifa", e.target.value)
                            }
                            disabled={processing}
                          />
                        </div>

                        {/* Total calculado */}
                        <div className="col-2">
                          <span
                            className="fw-semibold"
                            style={{
                              color: total > 0 ? "#198754" : "#adb5bd",
                              fontSize: "0.9rem",
                            }}
                          >
                            {total > 0 ? formatMoney(total) : "—"}
                          </span>
                        </div>

                        {/* Indicador */}
                        <div className="col-1 text-center">
                          {valido ? (
                            <i
                              className="bi bi-check-circle-fill text-success"
                              title="Listo para pagar"
                            ></i>
                          ) : (
                            <i
                              className="bi bi-clock text-warning"
                              title="Pendiente de datos"
                            ></i>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  data-bs-dismiss="modal"
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success px-4"
                  disabled={processing}
                >
                  {processing ? "Procesando..." : "Realizar pagos"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}