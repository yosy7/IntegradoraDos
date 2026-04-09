import { deleteUser } from "../../../../api/userService";
import { useState } from "react";

export default function DeleteUserModal({
  user = null,
  onDeleted = () => {},
  onClose = () => {},
}) {
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleDelete = async () => {
    const userId = user?.idUsuario ?? user?.id ?? null;

    if (!userId) {
      alert("No se encontró el id del usuario.");
      return;
    }

    try {
      setSubmitting(true);
      await deleteUser(userId);
      await onDeleted();
      onClose();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert(
        error?.response?.data?.message || "No se pudo eliminar el usuario."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-box">
        <h2 className="delete-modal-title">
          <i className="bi bi-layers-fill"></i>
          Eliminar integrante
        </h2>

        <p className="delete-modal-text">
          ¿Estás seguro de que deseas eliminar a{" "}
          <strong>{user?.nombre || user?.name || "este usuario"}</strong>?
        </p>

        <div className="delete-modal-actions">
          <button
            className="delete-btn-confirm"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "Eliminando..." : "Eliminar"}
          </button>

          <button
            className="delete-btn-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}