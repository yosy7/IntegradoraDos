import { useState } from "react";
import { createUser } from "../../../../api/userService";

export default function CreateMemberModal({ onSaved = () => {} }) {
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [correo, setCorreo] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [salario, setSalario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setNombre("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setCorreo("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setSalario("");
  };

  const closeModal = () => {
    const closeBtn = document.getElementById("btnCloseCreateMemberModal");
    if (closeBtn) closeBtn.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanNombre = nombre.trim();
    const cleanApellidoPaterno = apellidoPaterno.trim();
    const cleanApellidoMaterno = apellidoMaterno.trim();
    const cleanCorreo = correo.trim();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (
      !cleanNombre ||
      !cleanApellidoPaterno ||
      !cleanCorreo ||
      !cleanUsername ||
      !cleanPassword ||
      !cleanConfirmPassword
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        nombre: cleanNombre,
        apellidoPaterno: cleanApellidoPaterno,
        apellidoMaterno: cleanApellidoMaterno,
        correo: cleanCorreo,
        username: cleanUsername,
        password: cleanPassword,
        salario: salario ? Number(salario) : 0,
      };

      console.log("Payload createUser:", payload);

      await createUser(payload);

      resetForm();
      closeModal();
      await onSaved();
      alert("Usuario creado correctamente.");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      console.log("ERROR COMPLETO CREATE MEMBER:", error?.response?.data);

      const responseData = error?.response?.data;
      const fieldErrors = responseData?.data;

      if (fieldErrors && typeof fieldErrors === "object") {
        const messages = Object.entries(fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");

        alert(messages);
      } else {
        alert(responseData?.message || "No se pudo guardar el usuario.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade"
      id="createMemberModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4">
          <div className="modal-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="m-0">
                <i className="bi bi-person-fill me-2"></i>
                Crear Usuario
              </h4>

              <button
                id="btnCloseCreateMemberModal"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              ></button>
            </div>

            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-md-6">
                <label className="form-label">Nombre(s)*</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Apellido Paterno*</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Apellido paterno"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Apellido Materno</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Apellido materno"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Nombre de Usuario*</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo*</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Salario (quincenal)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Salario"
                  value={salario}
                  onChange={(e) => setSalario(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contraseña*</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Confirmar contraseña*</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="col-12 text-end mt-4">
                <button
                  className="btn btn-secondary me-2"
                  data-bs-dismiss="modal"
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancelar
                </button>

                <button className="btn btn-success" type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}