export default function UsersTabs({ activeTab, onChange }) {
  const isLeaders = activeTab === "leaders";

  return (
    <div className="btn-group" role="group" aria-label="tabs usuarios">
      <button
        type="button"
        className={`btn ${isLeaders ? "btn-success" : "btn-outline-success"}`}
        onClick={() => onChange("leaders")}
      >
        Líderes
      </button>

      <button
        type="button"
        className={`btn ${!isLeaders ? "btn-success" : "btn-outline-success"}`}
        onClick={() => onChange("members")}
      >
        Integrantes
      </button>
    </div>
  );
}