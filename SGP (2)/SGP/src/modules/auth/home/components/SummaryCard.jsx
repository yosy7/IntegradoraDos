export default function SummaryCard({
  icon,
  title,
  value,
  variant = "default",
  onClick,
}) {
  const clickable = typeof onClick === "function";

  return (
    <div
      className={`summary-card ${variant} ${clickable ? "summary-card-clickable" : ""}`}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={clickable ? { cursor: "pointer" } : {}}
    >
      <div className="summary-icon">{icon}</div>

      <div className="summary-info">
        <span className="summary-title">{title}</span>
      </div>

      <div className="summary-value">{value}</div>
    </div>
  );
}