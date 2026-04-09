import { useEffect, useState } from "react";
import { updateUser } from "../../../../api/userService";

export default function EditUserModal({
  modalId = "editUserModal",
  user = null,
  onSaved = () => {},
  showRole = false,
}) {
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [correo, setCorreo] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [salario, setSalario] = useState("");
  const [rol, setRol] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.firstName || "");
      setApellidoPaterno(user.lastNameP || "");
      setApellidoMaterno(user.lastNameM || "");
      setCorreo(user.email || "");
      setUsername(user.username || "");
      setPassword(user.password || "");
      setConfirmPassword(user.password || "");
      setSalario(user.salary || "");
      setRol(user.role || "");
    }
  }, [user]);

  const closeModal = () => {
    const closeBtn = document.getElementById(`btnClose-${modalId}`);
    if (closeBtn) closeBtn.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !nombre.trim() ||
      !apellidoPaterno.trim() ||
      !correo.trim() ||
      !username.trim()
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        nombre: nombre.trim(),
        apellidoPaterno: apellidoPaterno.trim(),
        apellidoMaterno: apellidoMaterno.trim(),
        correo: correo.trim(),
        username: username.trim(),
        password: password.trim(),
        salario: salario ? Number(salario) : 0,
      };

      if (showRole) {
        payload.rol = rol;
      }

      await updateUser(user.id, payload);
      closeModal();
      await onSaved();
      alert("Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert(error?.response?.data?.message || "No se pudo actualizar el usuario.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade"
      id={modalId}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4">
          <div className="modal-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="m-0 fw-bold">
                <i className="bi bi-person-fill me-2"></i>
                Editar Usuario
              </h2>

              <button
                id={`btnClose-${modalId}`}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nombre(s)*</label>
                <input
                  type="text"
                  className="form-control"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Apellido Paterno*</label>
                <input
                  type="text"
                  className="form-control"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Apellido Materno*</label>
                <input
                  type="text"
                  className="form-control"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Nombre de Usuario*</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Contraseña*</label>
                <input
                  type="text"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Confirmar contraseña*</label>
                <input
                  type="text"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Correo*</label>
                <input
                  type="email"
                  className="form-control"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              {showRole && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Rol*</label>
                  <select
                    className="form-select"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <option value="">Selecciona un rol</option>
                    <option value="LIDER">Líder</option>
                    <option value="INTEGRANTE">Integrante</option>
                  </select>
                </div>
              )}

              <div className="col-12">
                <label className="form-label fw-semibold">Salario (quincenal)</label>
                <input
                  type="number"
                  className="form-control"
                  value={salario}
                  onChange={(e) => setSalario(e.target.value)}
                />
              </div>

              <div className="col-12 text-end mt-4">
                <button
                  className="btn btn-outline-secondary me-2 px-4"
                  type="button"
                  data-bs-dismiss="modal"
                  disabled={submitting}
                >
                  Cancelar
                </button>

                <button className="btn btn-success px-4" type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}