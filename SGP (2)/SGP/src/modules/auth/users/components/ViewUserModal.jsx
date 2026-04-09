import { useEffect, useState } from "react";

export default function ViewUserModal({
  modalId = "viewUserModal",
  user = null,
  showRole = false,
}) {
  const [form, setForm] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    username: "",
    correo: "",
    fechaIngreso: "",
    salario: "",
    rol: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.firstName || "",
        apellidoPaterno: user.lastNameP || "",
        apellidoMaterno: user.lastNameM || "",
        username: user.username || "",
        correo: user.email || "",
        fechaIngreso: user.entryDate || "",
        salario: user.salary || "",
        rol: user.role || "",
      });
    } else {
      setForm({
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        username: "",
        correo: "",
        fechaIngreso: "",
        salario: "",
        rol: "",
      });
    }
  }, [user]);

  return (
    <div
      className="modal fade"
      id={modalId}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 rounded-4 shadow-sm">
          <div className="modal-body px-5 py-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <h2
                className="m-0 fw-bold text-dark w-100 text-center"
                style={{ fontSize: "2.2rem" }}
              >
                <i className="bi bi-person-fill me-3"></i>
                Ver Usuario
              </h2>

              <button
                type="button"
                className="btn-close position-absolute"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{ top: 24, right: 24 }}
              ></button>
            </div>

            <div className="row gx-4 gy-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold fs-5">Nombre(s)</label>
                <input
                  type="text"
                  className="form-control rounded-4"
                  value={form.nombre}
                  disabled
                  style={{ backgroundColor: "#d9d9d9", height: "48px" }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold fs-5">Apellido Paterno</label>
                <input
                  type="text"
                  className="form-control rounded-4"
                  value={form.apellidoPaterno}
                  disabled
                  style={{ backgroundColor: "#d9d9d9", height: "48px" }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold fs-5">Apellido Materno</label>
                <input
                  type="text"
                  className="form-control rounded-4"
                  value={form.apellidoMaterno}
                  disabled
                  style={{ backgroundColor: "#d9d9d9", height: "48px" }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold fs-5">Nombre de Usuario</label>
                <input
                  type="text"
                  className="form-control rounded-4"
                  value={form.username}
                  disabled
                  style={{ backgroundColor: "#d9d9d9", height: "48px" }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold fs-5">Correo</label>
                <input
                  type="text"
                  className="form-control rounded-4"
                  value={form.correo}
                  disabled
                  style={{ backgroundColor: "#d9d9d9", height: "48px" }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold fs-5">Fecha de ingreso</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control rounded-4 pe-5"
                    value={form.fechaIngreso}
                    disabled
                    style={{ backgroundColor: "#d9d9d9", height: "48px" }}
                  />
                  <i
                    className="bi bi-calendar-date position-absolute"
                    style={{
                      right: "18px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#7a7a7a",
                    }}
                  ></i>
                </div>
              </div>

              {showRole && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold fs-5">Rol</label>
                  <select
                    className="form-select rounded-4"
                    value={form.rol}
                    disabled
                    style={{ backgroundColor: "#d9d9d9", height: "48px" }}
                  >
                    <option value={form.rol}>{form.rol || "Sin rol"}</option>
                  </select>
                </div>
              )}

              <div className="col-12">
                <label className="form-label fw-semibold fs-5">
                  Salario (quincenal)
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control rounded-4 pe-5"
                    value={form.salario}
                    disabled
                    style={{ backgroundColor: "#d9d9d9", height: "48px" }}
                  />
                  <i
                    className="bi bi-currency-dollar position-absolute"
                    style={{
                      right: "18px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9a9a9a",
                    }}
                  ></i>
                </div>
              </div>

              <div className="col-12 d-flex justify-content-end mt-4">
                <button
                  className="btn btn-outline-secondary px-4 py-2 rounded-3"
                  type="button"
                  data-bs-dismiss="modal"
                  style={{ minWidth: "120px" }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}