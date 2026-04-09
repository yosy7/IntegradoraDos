export default function DeletePaymentModal({ payment, onDeletePayment, processing = false }) {
  if (!payment) return null;

  const nombreCompleto = [
    payment.usuario?.nombre,
    payment.usuario?.apellidoPaterno,
    payment.usuario?.apellidoMaterno,
  ]
    .filter(Boolean)
    .join(" ") || "—";

  const handleDelete = async () => {
    const paymentId = payment.idPago ?? payment.id ?? null;
    if (!paymentId) {
      alert("No se encontró el id del pago.");
      return;
    }
    await onDeletePayment(paymentId);
  };

  return (
    <div
      className="modal fade project-modal"
      id="deletePaymentModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4">
          <div className="modal-body p-4 p-md-5 text-center">
            <i
              className="bi bi-trash-fill"
              style={{ fontSize: "3rem", color: "#dc3545" }}
            ></i>

            <h2 className="modal-title-custom mt-3">Eliminar pago</h2>

            <p className="text-muted mb-1">
              ¿Estás segura de eliminar este pago?
            </p>

            <p className="fw-semibold mb-1">{nombreCompleto}</p>
            <p className="text-muted mb-0">{payment.nombreProyecto ?? "—"}</p>
            <p className="text-muted">{payment.periodo ?? "—"}</p>

            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary px-4"
                data-bs-dismiss="modal"
                disabled={processing}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn btn-danger px-4"
                onClick={handleDelete}
                disabled={processing}
              >
                {processing ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}