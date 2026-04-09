import { useEffect, useState } from "react";

const FORMAS = ["TRANSFERENCIA", "EFECTIVO", "CHEQUE", "TARJETA"];

export default function EditPaymentModal({ Payment, onEditPayment }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (Payment) {
      setForm({
        concepto: Payment.concepto ?? "",
        descripcion: Payment.descripcion ?? "",
        monto: Payment.monto ?? "",
        horas: Payment.horas ?? "",
        tarifa: Payment.tarifa ?? "",
        formaPayment: Payment.formaPayment ?? "TRANSFERENCIA",
        periodo: Payment.periodo ?? "",
      });
    }
  }, [Payment]);

  if (!form) return null;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleHorasOrTarifa = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const updated = { ...f, [field]: value };
      const h = parseFloat(field === "horas" ? value : f.horas);
      const t = parseFloat(field === "tarifa" ? value : f.tarifa);
      if (!isNaN(h) && !isNaN(t)) updated.monto = (h * t).toFixed(2);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.concepto.trim() || !form.monto || !form.formaPayment) {
      alert("Completa los campos obligatorios.");
      return;
    }
    const payload = {
      concepto: form.concepto.trim(),
      descripcion: form.descripcion.trim(),
      monto: parseFloat(form.monto),
      horas: form.horas ? parseFloat(form.horas) : null,
      tarifa: form.tarifa ? parseFloat(form.tarifa) : null,
      formaPayment: form.formaPayment,
      periodo: form.periodo.trim() || null,
      // mantener relaciones existentes
      proyecto: Payment.proyecto,
      usuario: Payment.usuario,
      registradoPor: Payment.registradoPor,
      categoria: Payment.categoria,
    };
    await onEditPayment(Payment.idPayment, payload);
    document.getElementById("btnCloseEditPaymentModal")?.click();
  };

  return (
    <div
      className="modal fade project-modal"
      id="editPaymentModal"
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
                <i className="bi bi-pencil-fill me-3"></i>Editar Payment
              </h2>
              <button
                id="btnCloseEditPaymentModal"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Concepto *</label>
                  <input
                    type="text"
                    className="form-control"
                    maxLength={150}
                    value={form.concepto}
                    onChange={set("concepto")}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    maxLength={255}
                    value={form.descripcion}
                    onChange={set("descripcion")}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Horas</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="form-control"
                    value={form.horas}
                    onChange={handleHorasOrTarifa("horas")}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tarifa/hora ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={form.tarifa}
                    onChange={handleHorasOrTarifa("tarifa")}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Monto total ($) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="form-control"
                    value={form.monto}
                    onChange={set("monto")}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Forma de Payment *</label>
                  <select className="form-select" value={form.formaPayment} onChange={set("formaPayment")}>
                    {FORMAS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Periodo</label>
                  <input
                    type="text"
                    className="form-control"
                    maxLength={50}
                    value={form.periodo}
                    onChange={set("periodo")}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
