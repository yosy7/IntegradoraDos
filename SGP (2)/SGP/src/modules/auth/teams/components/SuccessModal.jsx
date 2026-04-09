export default function SuccessModal({ title, message, onClose }) {
  return (
    <div className="custom-modal-backdrop">
      <div className="custom-modal-box text-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto mb-4"
          style={{ width: "70px", height: "70px", backgroundColor: "#2f7d78" }}
        >
          <i className="bi bi-check-lg fs-2"></i>
        </div>

        <h3 className="fw-bold mb-3" style={{ color: "#1f3f5b" }}>
          {title}
        </h3>

        <p className="text-secondary mb-4">{message}</p>

        <button className="project-btn-save w-100" onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
}