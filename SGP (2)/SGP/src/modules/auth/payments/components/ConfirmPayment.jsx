import { useEffect, useMemo, useState } from "react";

export default function ConfirmPaymentModal({
  payment,
  onConfirmPayment,
  formatMoney,
  processing = false,
}) {
  const [horas, setHoras] = useState("");
  const [tarifa, setTarifa] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (payment) {
      setHoras(payment.horas ?? "");
      setTarifa(payment.tarifa ?? "");
      setDescripcion(payment.descripcion ?? "");
    }
  }, [payment]);

  const total = useMemo(() => {
    const h = parseFloat(horas) || 0;
    const t = parseFloat(tarifa) || 0;
    return h * t;
  }, [horas, tarifa]);

  if (!payment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const horasNum = parseFloat(horas);
    const tarifaNum = parseFloat(tarifa);

    if (!horas || horasNum <= 0) {
      alert("Ingresa las horas trabajadas.");
      return;
    }

    if (!tarifa || tarifaNum <= 0) {
      alert("Ingresa la tarifa por hora.");
      return;
    }

    await onConfirmPayment({
      id: payment.idPago,
      horas: horasNum,
      tarifa: tarifaNum,
      descripcion,
    });
  };

  return (
    <div
      className="modal fade project-modal"
      id="confirmPaymentModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4">
          <div className="modal-body p-4 p-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="modal-title-custom m-0">
                <i className="bi bi-cash-coin me-3"></i>
                Realizar pago
              </h2>

              <button
                id="btnCloseConfirmPaymentModal"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                disabled={processing}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                className="rounded-4 p-3 mb-4"
                style={{
                  backgroundColor: "#f8fffe",
                  border: "1px solid #cfe3e0",
                }}
              >
                <p className="mb-2">
                  <strong>Persona:</strong> {payment.usuario?.nombre ?? "—"}
                </p>
                <p className="mb-2">
                  <strong>Proyecto:</strong> {payment.proyecto?.nombre ?? "—"}
                </p>
                <p className="mb-2">
                  <strong>Periodo:</strong> {payment.periodo ?? "—"}
                </p>
                <p className="mb-0">
                  <strong>Concepto:</strong> {payment.concepto ?? "—"}
                </p>
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Horas trabajadas *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control form-control-custom"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                    placeholder="Ej. 40"
                    disabled={processing}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Tarifa por hora ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control form-control-custom"
                    value={tarifa}
                    onChange={(e) => setTarifa(e.target.value)}
                    placeholder="Ej. 200"
                    disabled={processing}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Monto total ($)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={formatMoney(total)}
                    readOnly
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea
                    className="form-control form-control-custom"
                    rows="3"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Agrega una descripción del pago"
                    disabled={processing}
                  />
                </div>
              </div>

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
                  className="btn px-4"
                  style={{
                    background: "#198754",
                    color: "white",
                    border: "none",
                  }}
                  disabled={processing}
                >
                  {processing ? "Guardando..." : "Confirmar pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}