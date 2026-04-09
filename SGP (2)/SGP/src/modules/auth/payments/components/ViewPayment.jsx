export default function ViewPaymentModal({ payment, formatMoney }) {
  if (!payment) return null;

  const fechaPagoTexto = payment.fechaPago
    ? new Date(payment.fechaPago).toLocaleDateString("es-MX")
    : "—";

  const badgeClass =
    payment.estatus === "PAGADO" ? "text-bg-success" : "text-bg-warning";

  return (
    <div
      className="modal fade project-modal"
      id="viewPaymentModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4">
          <div className="modal-body p-4 p-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="modal-title-custom m-0">
                <i className="bi bi-eye-fill me-3"></i>
                Ver pago
              </h2>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Persona</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={payment.usuario?.nombre ?? ""}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Proyecto</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={payment.proyecto?.nombre ?? ""}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Periodo</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={payment.periodo ?? ""}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Estatus</label>
                <div className="pt-2">
                  <span className={`badge ${badgeClass}`}>{payment.estatus}</span>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Concepto</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={payment.concepto ?? "—"}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Descripción</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={payment.descripcion ?? "—"}
                  readOnly
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Horas trabajadas</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={payment.horas ?? "—"}
                  readOnly
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Tarifa por hora</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={payment.tarifa ? formatMoney(payment.tarifa) : "—"}
                  readOnly
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Monto total</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={formatMoney(payment.monto)}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha de pago</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={fechaPagoTexto}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Forma de pago</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={payment.formaPago ?? "TRANSFERENCIA"}
                  readOnly
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
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