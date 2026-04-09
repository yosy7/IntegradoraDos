import { useMemo, useState } from "react";

function getPeriodoQuincenalActual() {
  const hoy = new Date();

  const dia = hoy.getDate();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const ultimoDiaMes = new Date(anio, mes + 1, 0).getDate();

  if (dia <= 15) {
    return `01 al 15 de ${meses[mes]} ${anio}`;
  }

  return `16 al ${ultimoDiaMes} de ${meses[mes]} ${anio}`;
}

export default function CreatePaymentModal({ onAddPayment }) {
  const periodoActual = getPeriodoQuincenalActual();

  const [form, setForm] = useState({
    proyecto: "",
    persona: "",
    horas: "",
    tarifa: "200",
  });

  const proyectosDisponibles = [
    { id: 1, nombre: "SGP Web" },
    { id: 2, nombre: "Sistema de Inventario" },
    { id: 3, nombre: "Control Escolar" },
  ];

  const personasDisponibles = [
    { id: 1, nombre: "Juan Pérez" },
    { id: 2, nombre: "María López" },
    { id: 3, nombre: "Carlos Ruiz" },
  ];

  const totalCalculado = useMemo(() => {
    const horas = parseFloat(form.horas) || 0;
    const tarifa = parseFloat(form.tarifa) || 0;
    return (horas * tarifa).toFixed(2);
  }, [form.horas, form.tarifa]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      proyecto: "",
      persona: "",
      horas: "",
      tarifa: "200",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.proyecto || !form.persona || !form.horas) {
      alert("Completa los campos obligatorios.");
      return;
    }

    const proyectoSeleccionado = proyectosDisponibles.find(
      (p) => String(p.id) === String(form.proyecto)
    );

    const personaSeleccionada = personasDisponibles.find(
      (p) => String(p.id) === String(form.persona)
    );

    const payload = {
      proyecto: {
        idProyecto: proyectoSeleccionado?.id,
        nombre: proyectoSeleccionado?.nombre,
      },
      usuario: {
        idUsuario: personaSeleccionada?.id,
        nombre: personaSeleccionada?.nombre,
      },
      periodo: periodoActual,
      horas: Number(form.horas),
      tarifa: Number(form.tarifa),
      monto: Number(totalCalculado),
      formaPayment: "TRANSFERENCIA",
    };

    try {
      if (onAddPayment) {
        await onAddPayment(payload);
      }

      resetForm();
      document.getElementById("btnCloseCreatePaymentModal")?.click();
    } catch (error) {
      console.error("Error al registrar pago:", error);
      alert("No se pudo registrar el pago.");
    }
  };

  return (
    <div
      className="modal fade project-modal"
      id="createPaymentModal"
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
                <i className="bi bi-cash-stack me-3"></i>
                Registrar pago
              </h2>

              <button
                id="btnCloseCreatePaymentModal"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Proyecto *</label>
                  <select
                    className="form-select form-control-custom"
                    value={form.proyecto}
                    onChange={handleChange("proyecto")}
                  >
                    <option value="">Seleccionar proyecto</option>
                    {proyectosDisponibles.map((proyecto) => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Persona *</label>
                  <select
                    className="form-select form-control-custom"
                    value={form.persona}
                    onChange={handleChange("persona")}
                  >
                    <option value="">Seleccionar persona</option>
                    {personasDisponibles.map((persona) => (
                      <option key={persona.id} value={persona.id}>
                        {persona.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Periodo de pago</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={periodoActual}
                    readOnly
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Horas trabajadas *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-control form-control-custom"
                    value={form.horas}
                    onChange={handleChange("horas")}
                    placeholder="Ej. 40"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tarifa por hora ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control form-control-custom"
                    value={form.tarifa}
                    onChange={handleChange("tarifa")}
                    placeholder="Ej. 200"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Monto total ($)</label>
                  <input
                    type="number"
                    className="form-control form-control-custom"
                    value={totalCalculado}
                    readOnly
                  />
                </div>
              </div>

              

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  data-bs-dismiss="modal"
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
                >
                  Guardar como pendiente
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}