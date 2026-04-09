export default function MembersTable({
  data = [],
  onEdit,
  onDelete,
  onView,
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="teams-table-head">
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Equipo</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No hay resultados.
              </td>
            </tr>
          ) : (
            data.map((u, index) => (
              <tr key={u.id ?? index}>
                <td>{index + 1}</td>
                <td>{u.name ?? "-"}</td>
                <td>{u.username ?? "-"}</td>
                <td>{u.team ?? "-"}</td>

                <td className="text-center" style={{ width: 180 }}>
                  <button
  className="action-btn"
  title="Editar"
  data-bs-toggle="modal"
  data-bs-target="#editUserModal"
  onClick={() => onEdit && onEdit(u)}
>
  <i className="bi bi-pencil-fill action-icon"></i>
</button>

<button
  className="action-btn"
  title="Eliminar"
  data-bs-toggle="modal"
  data-bs-target="#deleteUserModal"
  onClick={() => onDelete && onDelete(u)}
>
  <i className="bi bi-trash-fill action-icon"></i>
</button>

<button
  className="action-btn"
  title="Ver"
  data-bs-toggle="modal"
  data-bs-target="#viewUserModal"
  onClick={() => onView && onView(u)}
>
  <i className="bi bi-eye-fill action-icon"></i>
</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}