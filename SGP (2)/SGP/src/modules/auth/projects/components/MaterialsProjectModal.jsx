import { useEffect, useMemo, useState } from "react";

const MATERIAL_INITIAL_STATE = {
  id: null,
  nombre: "",
  serie: "",
  ubicacion: "",
  fechaAdquisicion: "",
  cantidad: 1,
  estado: "Disponible",
  descripcion: "",
  tipo: "",
  precio: "",
};

export default function MaterialsProjectModal({
  projectName = "Proyecto",
  materials = [],
  readOnly = false,
  onClose,
  onSave,
}) {
  const [query, setQuery] = useState("");
  const [materialList, setMaterialList] = useState([]);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [form, setForm] = useState(MATERIAL_INITIAL_STATE);

  useEffect(() => {
    setMaterialList(materials);
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return materialList;

    return materialList.filter((m) => {
      return (
        m.nombre?.toLowerCase().includes(q) ||
        m.tipo?.toLowerCase().includes(q)
      );
    });
  }, [query, materialList]);

  const totalCosto = filteredMaterials.reduce(
    (acc, item) => acc + Number(item.cantidad || 0) * Number(item.precio || 0),
    0
  );

  const resetForm = () => {
    setForm(MATERIAL_INITIAL_STATE);
    setEditingMaterial(null);
  };

  const openCreateMaterial = () => {
    resetForm();
    setShowMaterialForm(true);
  };

  const openEditMaterial = (material) => {
    setEditingMaterial(material);
    setForm({
      id: material.id,
      nombre: material.nombre || "",
      serie: material.serie || "",
      ubicacion: material.ubicacion || "",
      fechaAdquisicion: material.fechaAdquisicion || "",
      cantidad: material.cantidad || 1,
      estado: material.estado || "Disponible",
      descripcion: material.descripcion || "",
      tipo: material.tipo || "",
      precio: material.precio || "",
    });
    setShowMaterialForm(true);
  };

  const handleDeleteMaterial = (id) => {
    setMaterialList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmitMaterial = (e) => {
    e.preventDefault();

    if (
      !form.nombre.trim() ||
      !form.serie.trim() ||
      !form.ubicacion.trim() ||
      !form.fechaAdquisicion ||
      !form.estado.trim()
    ) {
      alert("Completa los campos del material.");
      return;
    }

    const materialPayload = {
      id: form.id || Date.now(),
      nombre: form.nombre.trim(),
      serie: form.serie.trim(),
      ubicacion: form.ubicacion.trim(),
      fechaAdquisicion: form.fechaAdquisicion,
      cantidad: Number(form.cantidad) || 1,
      estado: form.estado,
      descripcion: form.descripcion.trim(),
      tipo: form.tipo.trim() || form.ubicacion.trim(),
      precio: Number(form.precio) || 0,
    };

    if (editingMaterial) {
      setMaterialList((prev) =>
        prev.map((item) => (item.id === materialPayload.id ? materialPayload : item))
      );
    } else {
      setMaterialList((prev) => [...prev, materialPayload]);
    }

    setShowMaterialForm(false);
    resetForm();
  };

  const handleSaveAll = () => {
    onSave(materialList);
  };

  return (
    <>
      <div className="custom-materials-overlay">
        <div className="custom-materials-modal project-modal">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="modal-title-custom m-0">
              Materiales del Proyecto {projectName}
            </h2>

            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4">
            <div className="input-group" style={{ maxWidth: 640 }}>
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Buscar materiales..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {!readOnly && (
              <button
                type="button"
                className="btn btn-success"
                onClick={openCreateMaterial}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Agregar material
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="teams-table-head">
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                  {!readOnly && <th className="text-center"></th>}
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={readOnly ? 5 : 6}
                      className="text-center py-4"
                    >
                      No hay materiales.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nombre}</td>
                      <td>{item.tipo}</td>
                      <td>{item.cantidad}</td>
                      <td>${item.precio} MXN</td>
                      <td className="fw-bold">
                        ${Number(item.cantidad) * Number(item.precio)} MXN
                      </td>
                      {!readOnly && (
                        <td className="text-center">
                          <button
                            className="action-btn"
                            type="button"
                            onClick={() => openEditMaterial(item)}
                          >
                            <i className="bi bi-pencil-fill action-icon"></i>
                          </button>

                          <button
                            className="action-btn"
                            type="button"
                            onClick={() => handleDeleteMaterial(item.id)}
                          >
                            <i className="bi bi-trash-fill action-icon"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between mt-3 fw-semibold flex-wrap gap-3">
            <span>Total de materiales: {filteredMaterials.length}</span>
            <span>Costo total: ${totalCosto} MXN</span>
          </div>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <button type="button" className="project-btn-cancel" onClick={onClose}>
              Cerrar
            </button>

            {!readOnly && (
              <button
                type="button"
                className="project-btn-save"
                onClick={handleSaveAll}
              >
                Guardar cambios
              </button>
            )}
          </div>
        </div>
      </div>

      {showMaterialForm && (
        <div className="custom-materials-overlay material-form-overlay">
          <div className="custom-add-material-modal project-modal">
            <div className="mb-4">
              <h2 className="modal-title-custom text-center m-0">
                <i className="bi bi-layers-fill me-3"></i>
                {editingMaterial ? "Editar material" : "Agregar material"}
              </h2>
            </div>

            <form onSubmit={handleSubmitMaterial}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre del material</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">No. de Serie</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.serie}
                    onChange={(e) =>
                      setForm({ ...form, serie: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Ubicación</label>
                  <select
                    className="form-select"
                    value={form.ubicacion}
                    onChange={(e) =>
                      setForm({ ...form, ubicacion: e.target.value })
                    }
                  >
                    <option value="">Ubicación</option>
                    <option value="Bodega A">Bodega A</option>
                    <option value="Bodega B">Bodega B</option>
                    <option value="Patio">Patio</option>
                    <option value="Almacén">Almacén</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Fecha de adquisición</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.fechaAdquisicion}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fechaAdquisicion: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={form.cantidad}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cantidad: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={form.estado}
                    onChange={(e) =>
                      setForm({ ...form, estado: e.target.value })
                    }
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En uso">En uso</option>
                    <option value="Agotado">Agotado</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Tipo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.tipo}
                    onChange={(e) =>
                      setForm({ ...form, tipo: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Precio</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={form.precio}
                    onChange={(e) =>
                      setForm({ ...form, precio: e.target.value })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        descripcion: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 mt-4">
                <button
                  type="button"
                  className="project-btn-cancel"
                  onClick={() => {
                    resetForm();
                    setShowMaterialForm(false);
                  }}
                >
                  Cancelar
                </button>

                <button type="submit" className="project-btn-save">
                  Guardar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}