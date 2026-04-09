export default function ProjectFilters({
  search,
  setSearch,
  selectedStatus,
  setSelectedStatus,
}) {
  return (
    <div className="project-filters">
      <div className="search-box">
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Buscar proyectos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-buttons">
        <button
          className={`status-btn risk ${selectedStatus === "riesgo" ? "active" : ""}`}
          onClick={() =>
            setSelectedStatus(selectedStatus === "riesgo" ? "todos" : "riesgo")
          }
        >
          <i className="bi bi-exclamation-triangle-fill"></i>
          En riesgo
        </button>

        <button
          className={`status-btn stable ${selectedStatus === "estable" ? "active" : ""}`}
          onClick={() =>
            setSelectedStatus(selectedStatus === "estable" ? "todos" : "estable")
          }
        >
          <i className="bi bi-check-lg"></i>
          Estables
        </button>
      </div>
    </div>
  );
}