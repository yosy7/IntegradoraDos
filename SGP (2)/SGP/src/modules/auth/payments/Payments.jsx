import { useEffect, useMemo, useState } from "react";
import PaymentRow from "./components/PaymentRow";
import ViewPaymentModal from "./components/ViewPayment";
import DeletePaymentModal from "./components/DeletePayment";
import ConfirmPaymentModal from "./components/ConfirmPayment";
import GenerarPagoModal from "./components/GenerarPago";
import PagarPendientesModal from "./components/PagarPendientes";
import {
  getPayments,
  deletePayment,
  realizarPayment,
  generarPagosPeriodo,
  realizarTodosPendientes,
} from "../../../api/paymentService";

// Devuelve true si hoy es día 15 o el último día del mes
const esDiaHabilitado = () => {
  const hoy = new Date();
  const dia = hoy.getDate();
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  return dia === 15 || dia === ultimoDia;
};

export default function Payments() {
  const [query, setQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const habilitadoGenerar = esDiaHabilitado();

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  const openModal = (modalId) => {
    const el = document.getElementById(modalId);
    if (!el || !window.bootstrap) return;
    window.bootstrap.Modal.getOrCreateInstance(el).show();
  };

  const closeModal = (modalId) => {
    const el = document.getElementById(modalId);
    if (!el || !window.bootstrap) return;
    window.bootstrap.Modal.getInstance(el)?.hide();
  };

  // ── Carga ──────────────────────────────────────────────────────────────────

  const handleGetPayments = async () => {
    try {
      setLoading(true);
      const response = await getPayments();
      setPayments(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      setPayments([]);
      alert("No se pudieron cargar los pagos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetPayments();
  }, []);

  // ── Acciones de tabla ─────────────────────────────────────────────────────

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    openModal("viewPaymentModal");
  };

  const handleAskDeletePayment = (payment) => {
    setSelectedPayment(payment);
    openModal("deletePaymentModal");
  };

  const handleAskConfirmPayment = (payment) => {
    setSelectedPayment(payment);
    openModal("confirmPaymentModal");
  };

  const handleDeletePayment = async (id) => {
    try {
      setProcessing(true);
      await deletePayment(id);
      closeModal("deletePaymentModal");
      setSelectedPayment(null);
      await handleGetPayments();
      alert("Pago eliminado correctamente.");
    } catch (error) {
      alert(error?.response?.data?.message || "No se pudo eliminar el pago.");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPayment = async ({ id, horas, tarifa, descripcion }) => {
    try {
      setProcessing(true);
      await realizarPayment(id, { horas, tarifa, descripcion });
      closeModal("confirmPaymentModal");
      setSelectedPayment(null);
      await handleGetPayments();
      alert("Pago realizado correctamente.");
    } catch (error) {
      alert(error?.response?.data?.message || "No se pudo realizar el pago.");
    } finally {
      setProcessing(false);
    }
  };

  // ── Generar periodo ────────────────────────────────────────────────────────

  const handleGenerarPago = async ({ proyectosIds, periodo }) => {
    try {
      setProcessing(true);
      let totalGenerados = 0;

      // Llamar al endpoint una vez por cada proyecto seleccionado
      for (const idProyecto of proyectosIds) {
        try {
          const response = await generarPagosPeriodo(idProyecto, periodo);
          totalGenerados += response?.data?.length ?? 0;
        } catch (err) {
          console.error(`Error generando pagos para proyecto ${idProyecto}:`, err);
        }
      }

      closeModal("generarPagoModal");
      await handleGetPayments();

      if (totalGenerados === 0) {
        alert("Todos los integrantes ya tienen pago generado para este periodo.");
      } else {
        alert(`Se generaron ${totalGenerados} pago(s) pendiente(s) correctamente.`);
      }
    } catch (error) {
      alert(error?.response?.data?.message || "No se pudieron generar los pagos.");
    } finally {
      setProcessing(false);
    }
  };

  // ── Pagar todos los pendientes ─────────────────────────────────────────────

  const handlePagarTodosPendientes = async ({ idProyecto, dtoList }) => {
    try {
      setProcessing(true);
      const response = await realizarTodosPendientes(idProyecto, dtoList);
      const resultado = response?.data;
      closeModal("pagarPendientesModal");
      await handleGetPayments();
      const pagados = resultado?.totalPagados ?? 0;
      const errores = resultado?.errores ?? [];
      if (errores.length > 0) {
        alert(
          `Se pagaron ${pagados} integrante(s).\nHubo ${errores.length} error(es):\n${errores.join("\n")}`
        );
      } else {
        alert(`Se realizaron ${pagados} pago(s) correctamente.`);
      }
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudieron realizar los pagos."
      );
    } finally {
      setProcessing(false);
    }
  };

  // ── Pendientes para el modal de pagar todos ────────────────────────────────

  const pagosPendientes = useMemo(
    () => payments.filter((p) => p.estatus === "PENDIENTE"),
    [payments]
  );

  // ── Filtro de búsqueda ─────────────────────────────────────────────────────

  const filteredPayments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((payment) => {
      const persona = payment.usuario?.nombre?.toLowerCase() ?? "";
      const proyecto = payment.nombreProyecto?.toLowerCase() ?? "";
      const periodo = payment.periodo?.toLowerCase() ?? "";
      const estatus = payment.estatus?.toLowerCase() ?? "";
      const concepto = payment.concepto?.toLowerCase() ?? "";
      return (
        persona.includes(q) ||
        proyecto.includes(q) ||
        periodo.includes(q) ||
        estatus.includes(q) ||
        concepto.includes(q)
      );
    });
  }, [payments, query]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Encabezado */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <h2 className="m-0">
          <i className="bi bi-cash-stack me-2"></i>
          Pagos
        </h2>

        {/* Botones de acción */}
        <div className="d-flex gap-2 flex-wrap">
          {/* Botón 1: Generar pagos del periodo */}
          <button
            className="btn btn-outline-primary"
            onClick={() => openModal("generarPagoModal")}
            disabled={!habilitadoGenerar}
            title={
              habilitadoGenerar
                ? "Generar pagos para el periodo actual"
                : "Solo disponible el día 15 o el último día del mes"
            }
          >
            <i className="bi bi-calendar-plus me-2"></i>
            Generar periodo
          </button>

          {/* Botón 2: Pagar todos los pendientes */}
          <button
            className="btn btn-success"
            onClick={() => openModal("pagarPendientesModal")}
            disabled={pagosPendientes.length === 0}
            title={
              pagosPendientes.length === 0
                ? "No hay pagos pendientes"
                : `Hay ${pagosPendientes.length} pago(s) pendiente(s)`
            }
          >
            <i className="bi bi-cash-coin me-2"></i>
            Pagar pendientes
            {pagosPendientes.length > 0 && (
              <span className="badge bg-white text-success ms-2">
                {pagosPendientes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Buscador */}
      <section className="mb-4">
        <div className="input-group" style={{ maxWidth: "500px" }}>
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por persona, proyecto, periodo, concepto o estatus"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Tabla */}
      <section>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="teams-table-head">
              <tr>
                <th>Persona</th>
                <th>Proyecto</th>
                <th>Periodo</th>
                <th>Horas</th>
                <th>Tarifa</th>
                <th>Total</th>
                <th>Estatus</th>
                <th>Fecha de pago</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Cargando pagos...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No hay pagos registrados.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <PaymentRow
                    key={payment.idPago}
                    payment={payment}
                    onView={handleViewPayment}
                    onDelete={handleAskDeletePayment}
                    onConfirmPay={handleAskConfirmPayment}
                    formatMoney={formatMoney}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modales */}
      <ViewPaymentModal payment={selectedPayment} formatMoney={formatMoney} />

      <DeletePaymentModal
        payment={selectedPayment}
        onDeletePayment={handleDeletePayment}
        processing={processing}
      />

      <ConfirmPaymentModal
        payment={selectedPayment}
        onConfirmPayment={handleConfirmPayment}
        formatMoney={formatMoney}
        processing={processing}
      />

      <GenerarPagoModal
        onGenerar={handleGenerarPago}
        processing={processing}
      />

      <PagarPendientesModal
        pagosPendientes={pagosPendientes}
        onPagar={handlePagarTodosPendientes}
        formatMoney={formatMoney}
        processing={processing}
      />
    </div>
  );
}