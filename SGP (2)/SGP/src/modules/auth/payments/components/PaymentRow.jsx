export default function PaymentRow({
  payment,
  onView,
  onDelete,
  onConfirmPay,
  formatMoney,
}) {
  const badgeClass =
    payment.estatus === "PAGADO" ? "text-bg-success" : "text-bg-warning";

  const fechaPagoTexto = payment.fechaPago
    ? new Date(payment.fechaPago).toLocaleDateString("es-MX")
    : "—";

  const nombreCompleto = [
    payment.usuario?.nombre,
    payment.usuario?.apellidoPaterno,
    payment.usuario?.apellidoMaterno,
  ]
    .filter(Boolean)
    .join(" ") || "—";

  // Solo se puede eliminar si el pago ya fue PAGADO
  const puedeEliminar = payment.estatus === "PAGADO";

  return (
    <tr>
      <td>{nombreCompleto}</td>
      <td>{payment.nombreProyecto ?? "—"}</td>
      <td>{payment.periodo ?? "—"}</td>
      <td>{payment.horas ?? "—"}</td>
      <td>{payment.tarifa ? formatMoney(payment.tarifa) : "—"}</td>
      <td className="fw-semibold">{formatMoney(payment.monto)}</td>

      <td>
        <span className={`badge ${badgeClass}`}>{payment.estatus}</span>
      </td>

      <td>{fechaPagoTexto}</td>

      <td className="text-center" style={{ width: 190 }}>
        {/* Eliminar — solo aparece si el pago ya fue PAGADO */}
        {puedeEliminar && (
          <button
            className="action-btn"
            title="Eliminar"
            onClick={() => onDelete(payment)}
          >
            <i className="bi bi-trash-fill action-icon text-danger"></i>
          </button>
        )}

        <button
          className="action-btn"
          title="Ver detalle"
          onClick={() => onView(payment)}
        >
          <i className="bi bi-eye-fill action-icon"></i>
        </button>

        {payment.estatus === "PENDIENTE" && (
          <button
            className="action-btn"
            title="Realizar pago"
            onClick={() => onConfirmPay(payment)}
          >
            <i className="bi bi-cash-coin action-icon text-success"></i>
          </button>
        )}
      </td>
    </tr>
  );
}