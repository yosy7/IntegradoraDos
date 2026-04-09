import { useEffect, useMemo, useState } from "react";
import "./leader.css";
import { getMyProjects, updateProject } from "../../../api/projectService";
import { getMyTeam, getMyMembers, addMemberToTeam, removeMemberFromTeam, changeTeamLeader } from "../../../api/teamService";
import { getAvailableUsersForTeam, createUser } from "../../../api/userService";

function fullName(user) {
  return [user?.nombre, user?.apellidoPaterno, user?.apellidoMaterno]
    .filter(Boolean).join(" ").trim();
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2)
    .map((s) => s[0]?.toUpperCase()).join("") || "U";
}

function BasicModal({ show, title, children, onClose, maxWidth = 700 }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 36,
        width: "90%", maxWidth, maxHeight: "90vh", overflowY: "auto",
        position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666",
        }}>×</button>
        <h4 style={{ marginBottom: 24, color: "#1a3a4a", fontWeight: 700 }}>{title}</h4>
        {children}
      </div>
    </div>
  );
}

export default function LeaderHome() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [modal, setModal] = useState({ type: "", data: null });
  const [submitting, setSubmitting] = useState(false);

  const currentUserId = Number(sessionStorage.getItem("idUsuario") || 0);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, teamRes, membersRes, availableRes] = await Promise.all([
        getMyProjects(), getMyTeam(), getMyMembers(), getAvailableUsersForTeam(),
      ]);
      setProjects(Array.isArray(projectsRes?.data) ? projectsRes.data : Array.isArray(projectsRes) ? projectsRes : []);
      const teamData = teamRes?.data;
setTeam(Array.isArray(teamData) ? teamData[0] || null : teamData || null);
      setMembers(Array.isArray(membersRes?.data) ? membersRes.data : Array.isArray(membersRes) ? membersRes : []);
      setAvailableUsers(Array.isArray(availableRes?.data) ? availableRes.data : Array.isArray(availableRes) ? availableRes : []);
    } catch (err) {
      console.error(err);
      setProjects([]); setTeam(null); setMembers([]); setAvailableUsers([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const mappedProjects = useMemo(() => projects.map((p) => ({
    id: p?.idProyecto || p?.id,
    nombre: p?.nombre || "Sin nombre",
    descripcion: p?.descripcion || "Sin descripción",
    progreso: Number(p?.porcentajeAvance ?? p?.avance ?? 0),
    estado: p?.estado || "PENDIENTE",
    inicio: p?.fechaInicio || "",
    fin: p?.fechaFin || "",
    presupuesto: p?.presupuestoTotal || 0,
    logo: p?.logo || "",
    raw: p,
  })), [projects]);

  const mappedMembers = useMemo(() => members
    .filter((m) => (m?.idUsuario || m?.id) !== currentUserId)
    .map((m) => ({
      id: m?.idUsuario || m?.id,
      nombre: fullName(m) || m?.nombre || "Sin nombre",
      username: m?.username || "",
      correo: m?.correo || "",
      rol: (typeof m?.rol === "string" ? m?.rol : m?.rol?.nombre) || "Integrante",
      salario: m?.salario || "",
      fechaRegistro: m?.fechaRegistro || "",
      raw: m,
    })), [members, currentUserId]);

  const openModal = (type, data = null) => setModal({ type, data });
  const closeModal = () => setModal({ type: "", data: null });

  const handleSaveProject = async (form) => {
    const p = modal.data;
    if (!p?.id) return;
    try {
      setSubmitting(true);
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        fechaInicio: p.raw?.fechaInicio || null,
        fechaFin: form.fechaFin || null,
        presupuestoTotal: form.presupuesto ? Number(form.presupuesto) : null,
        logo: form.logo || null,
        estado: p.raw?.estado || "PENDIENTE",
        equipo: p.raw?.equipo ? { idEquipo: p.raw.equipo.idEquipo || p.raw.equipo.id } : null,
        lider: p.raw?.lider ? { idUsuario: p.raw.lider.idUsuario || p.raw.lider.id } : null,
      };
      await updateProject(p.id, payload);
      closeModal();
      await loadData();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo actualizar el proyecto.");
    } finally { setSubmitting(false); }
  };

  

  const handleAddMember = async (idUsuario) => {
  const teamId = team?.idEquipo || team?.id;
  console.log("team:", team);
  console.log("teamId:", teamId);
  console.log("idUsuario:", idUsuario);
  if (!teamId || !idUsuario) {
    alert("No se encontró el equipo. team: " + JSON.stringify(team));
    return;
  }
    try {
      setSubmitting(true);
      await addMemberToTeam(teamId, Number(idUsuario));
      closeModal();
      await loadData();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo agregar el integrante.");
    } finally { setSubmitting(false); }
  };

  const handleCreateMember = async (form) => {
  const teamId = team?.idEquipo || team?.id;
  try {
    setSubmitting(true);
    // 1. Crear el usuario
    const res = await createUser(form);
    const nuevoUsuario = res?.data?.idUsuario || res?.data?.id;

    // 2. Si se creó bien y tenemos equipo, asignarlo
    if (nuevoUsuario && teamId) {
      await addMemberToTeam(teamId, nuevoUsuario);
    }

    closeModal();
    await loadData();
  } catch (e) {
    alert(e?.response?.data?.message || "No se pudo crear el integrante.");
  } finally { setSubmitting(false); }
};

  const handleRemoveMember = async () => {
    const teamId = team?.idEquipo || team?.id;
    const memberId = modal.data?.id;
    if (!teamId || !memberId) return;
    try {
      setSubmitting(true);
      await removeMemberFromTeam(teamId, memberId);
      closeModal();
      await loadData();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo sacar al integrante.");
    } finally { setSubmitting(false); }
  };

  const handleChangeLeader = async (idNuevoLider) => {
    const teamId = team?.idEquipo || team?.id;
    if (!teamId || !idNuevoLider) return;
    try {
      setSubmitting(true);
      await changeTeamLeader(teamId, currentUserId, Number(idNuevoLider));
      closeModal();
      await loadData();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo cambiar el líder.");
    } finally { setSubmitting(false); }
  };

  // ── Colores de estado ──
  const estadoColor = (e) => {
    const s = (e || "").toLowerCase();
    if (s.includes("finaliz") || s.includes("complet")) return { bg: "#e8f5e9", color: "#2e7d32" };
    if (s.includes("curso") || s.includes("progreso")) return { bg: "#e3f2fd", color: "#1565c0" };
    if (s.includes("cancel")) return { bg: "#fce4ec", color: "#c62828" };
    return { bg: "#fff8e1", color: "#f57f17" };
  };

  return (
    <div style={{ padding: "0 8px" }}>
      {/* ── PROYECTOS ── */}
      <h4 style={{ color: "#1a3a4a", fontWeight: 700, marginBottom: 20 }}>
        <i className="bi bi-folder-fill me-2"></i>Proyectos
      </h4>

      {loading ? (
        <p className="text-muted">Cargando proyectos...</p>
      ) : mappedProjects.length === 0 ? (
        <p className="text-muted">No tienes proyectos asignados.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100%, 1fr))", gap: 20, marginBottom: 40, justifyContent: "start" }}>
          {mappedProjects.map((p) => {
            const ec = estadoColor(p.estado);
            return (
              <div key={p.id} style={{
                background: "#fff", borderRadius: 12, padding: 22,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
              }}>
                <h6 style={{ fontWeight: 700, color: "#1a3a4a", marginBottom: 4 }}>{p.nombre}</h6>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>{p.descripcion}</p>

                {/* barra progreso */}
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Progreso:</div>
                <div style={{ background: "#eee", borderRadius: 8, height: 8, marginBottom: 6 }}>
                  <div style={{
                    width: `${Math.min(p.progreso, 100)}%`, height: "100%",
                    background: "#2f7d78", borderRadius: 8, transition: "width .4s",
                  }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{
                    fontSize: 12, padding: "2px 10px", borderRadius: 20,
                    background: ec.bg, color: ec.color, fontWeight: 600,
                  }}>{p.estado}</span>
                  <strong style={{ color: "#2f7d78" }}>{p.progreso}%</strong>
                </div>

                <div style={{ fontSize: 12, color: "#999", marginBottom: 14 }}>
                  <span>Inicio: {p.inicio || "—"}</span>
                  <span style={{ marginLeft: 16 }}>Fin: {p.fin || "—"}</span>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => openModal("view-project", p)}
                    style={{width:200, padding: "7px 0", borderRadius: 8, border: "none", background: "#2f7d78", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                    Ver más
                  </button>
                  <button onClick={() => openModal("edit-project", p)}
                    style={{width:200, padding: "7px 0", borderRadius: 8, border: "none", background: "#2f7d78", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MIEMBROS ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h4 style={{ color: "#1a3a4a", fontWeight: 700, margin: 0 }}>
          <i className="bi bi-people-fill me-2"></i>Miembros del Equipo
        </h4>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => openModal("add-member")}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#2f7d78", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            + Agregar Integrante
          </button>
          <button onClick={() => openModal("create-member")}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#2f7d78", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            + Crear Integrante
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Cargando integrantes...</p>
      ) : mappedMembers.length === 0 ? (
        <p className="text-muted">No hay integrantes para mostrar.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          {mappedMembers.map((m) => (
            <div key={m.id} style={{
              background: "#fff", borderRadius: 14, padding: 20, textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0",
            }}>
              {/* avatar */}
              <div style={{
                width: 56, height: 56, borderRadius: "50%", background: "#2f7d78",
                color: "#fff", fontSize: 20, fontWeight: 700, display: "flex",
                alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
              }}>{initials(m.nombre)}</div>

              <div style={{ fontWeight: 700, color: "#1a3a4a", fontSize: 14, marginBottom: 2 }}>{m.nombre}</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>{m.rol}</div>

              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 6 }}>
                <button onClick={() => openModal("view-member", m)}
                  style={{ width: "50%", padding: "4px 12px", borderRadius: 6, border: "none", background: "#2f7d78", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                  Ver
                </button>
                <button onClick={() => openModal("change-leader", m)}
                  style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#2f7d78", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                  Editar
                </button>
              </div>
              <button onClick={() => openModal("remove-member", m)}
                style={{ width: "100%", padding: "5px 0", borderRadius: 6, border: "none", background: "#e53935", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── MODALES ── */}
      {/* Ver proyecto */}
      <BasicModal show={modal.type === "view-project"} title="🗂 Ver Proyecto" onClose={closeModal}>
        {modal.data && (
          <div>
            <Field label="Nombre" value={modal.data.nombre} />
            <Field label="Descripción" value={modal.data.descripcion} />
            <Field label="Estado" value={modal.data.estado} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Fecha inicio" value={modal.data.inicio || "—"} />
              <Field label="Fecha fin" value={modal.data.fin || "—"} />
            </div>
            <Field label="Presupuesto" value={modal.data.presupuesto} />
            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button onClick={closeModal} style={btnOutline}>Cerrar</button>
            </div>
          </div>
        )}
      </BasicModal>

      {/* Editar proyecto */}
      <EditProjectModal show={modal.type === "edit-project"} project={modal.data}
        onClose={closeModal} onSave={handleSaveProject} submitting={submitting} />

      {/* Ver miembro */}
      <BasicModal show={modal.type === "view-member"} title="👤 Ver Integrante" onClose={closeModal}>
        {modal.data && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Nombre(s)" value={modal.data.raw?.nombre || ""} />
              <Field label="Apellido Paterno" value={modal.data.raw?.apellidoPaterno || "—"} />
              <Field label="Apellido Materno" value={modal.data.raw?.apellidoMaterno || "—"} />
              <Field label="Usuario" value={modal.data.username || "—"} />
              <Field label="Correo" value={modal.data.correo || "—"} />
              <Field label="Rol" value={modal.data.rol || "—"} />
              <Field label="Salario" value={modal.data.salario || "—"} />
              <Field label="Fecha ingreso" value={modal.data.fechaRegistro || "—"} />
            </div>
            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button onClick={closeModal} style={btnOutline}>Cerrar</button>
            </div>
          </div>
        )}
      </BasicModal>

      {/* Agregar integrante existente */}
      <AddMemberModal show={modal.type === "add-member"} availableUsers={availableUsers}
        onClose={closeModal} onSubmit={handleAddMember} submitting={submitting} />

      {/* Crear nuevo integrante */}
      <CreateMemberModal show={modal.type === "create-member"}
        onClose={closeModal} onSubmit={handleCreateMember} submitting={submitting} />

      {/* Sacar del equipo */}
      <BasicModal show={modal.type === "remove-member"} title="⚠️ Eliminar del equipo" onClose={closeModal} maxWidth={500}>
        <p style={{ color: "#555", marginBottom: 24 }}>
          ¿Estás seguro de que deseas sacar a <strong>{modal.data?.nombre}</strong> del equipo?
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={closeModal} style={btnOutline}>Cancelar</button>
          <button onClick={handleRemoveMember} disabled={submitting} style={btnDanger}>
            {submitting ? "Procesando..." : "Sacar del equipo"}
          </button>
        </div>
      </BasicModal>

      {/* Cambiar líder */}
      <ChangeLeaderModal show={modal.type === "change-leader"} member={modal.data}
        members={mappedMembers} onClose={closeModal} onSubmit={handleChangeLeader} submitting={submitting} />
    </div>
  );
}

// ─── Modal Editar Proyecto ─────────────────────────────────────────────────
function EditProjectModal({ show, project, onClose, onSave, submitting }) {
  const [form, setForm] = useState({ nombre: "", presupuesto: "", fechaFin: "", descripcion: "", logo: "" });

  useEffect(() => {
    if (project) {
      setForm({
        nombre: project.nombre || "",
        presupuesto: project.presupuesto || "",
        fechaFin: project.fin || "",
        descripcion: project.descripcion || "",
        logo: project.logo || "",
      });
    }
  }, [project]);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 36,
        width: "90%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
        position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666",
        }}>×</button>
        <h4 style={{ marginBottom: 24, color: "#1a3a4a", fontWeight: 700 }}>
          ✏️ Editar Proyecto
        </h4>
        <div>
          <FormField label="Nombre del Proyecto *" value={form.nombre}
            onChange={(v) => setForm({ ...form, nombre: v })} />
          <FormField label="Descripción" value={form.descripcion} textarea
            onChange={(v) => setForm({ ...form, descripcion: v })} />
          <FormField label="Presupuesto" type="number" value={form.presupuesto}
            onChange={(v) => setForm({ ...form, presupuesto: v })} />
          <FormField label="Fecha de fin" type="date" value={form.fechaFin}
            onChange={(v) => setForm({ ...form, fechaFin: v })} />
          <FormField label="Logo (URL)" value={form.logo}
            onChange={(v) => setForm({ ...form, logo: v })} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
            <button onClick={onClose} style={btnOutline}>Cancelar</button>
            <button onClick={() => onSave(form)} disabled={submitting} style={btnPrimary}>
              {submitting ? "Guardando..." : "Guardar proyecto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Agregar Integrante ──────────────────────────────────────────────
function AddMemberModal({ show, availableUsers, onClose, onSubmit, submitting }) {
  const [selectedId, setSelectedId] = useState("");
  
  useEffect(() => { 
    if (show) setSelectedId(""); 
  }, [show]);
  
  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 36,
        width: "90%", maxWidth: 500, position: "relative",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666"
        }}>×</button>
        <h4 style={{ marginBottom: 24, color: "#1a3a4a", fontWeight: 700 }}>
          + Agregar Integrante
        </h4>
        <label style={labelStyle}>Selecciona un integrante disponible</label>
        <select 
          value={selectedId} 
          onChange={(e) => {
            console.log("Seleccionado:", e.target.value);
            setSelectedId(e.target.value);
          }} 
          style={inputStyle}
        >
          <option value="">-- Selecciona --</option>
          {availableUsers.map((u) => (
            <option key={u.idUsuario || u.id} value={String(u.idUsuario || u.id)}>
              {[u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(" ")}
            </option>
          ))}
        </select>
        {availableUsers.length === 0 && (
          <p style={{ color: "#999", fontSize: 13 }}>
            No hay integrantes disponibles sin equipo.
          </p>
        )}
        <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>
          Seleccionado: {selectedId || "ninguno"}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={btnOutline}>Cancelar</button>
          <button 
  onClick={(e) => {
    e.stopPropagation();
    console.log("CLICK en agregar, selectedId:", selectedId);
    if (selectedId) onSubmit(selectedId);
  }} 
  style={{
    ...btnPrimary,
    opacity: 1,
    cursor: "pointer",
    pointerEvents: "all",
    position: "relative",
    zIndex: 9999,
  }}
>
  {submitting ? "Agregando..." : "Agregar al equipo"}
</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Crear Integrante ────────────────────────────────────────────────
function CreateMemberModal({ show, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({ nombre: "", apellidoPaterno: "", apellidoMaterno: "", correo: "", username: "", password: "", salario: "" });
  useEffect(() => { if (show) setForm({ nombre: "", apellidoPaterno: "", apellidoMaterno: "", correo: "", username: "", password: "", salario: "" }); }, [show]);
  if (!show) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 36, width: "90%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666" }}>×</button>
        <h4 style={{ marginBottom: 24, color: "#1a3a4a", fontWeight: 700 }}>+ Crear Integrante</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Nombre(s) *" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
          <FormField label="Apellido Paterno *" value={form.apellidoPaterno} onChange={(v) => setForm({ ...form, apellidoPaterno: v })} />
          <FormField label="Apellido Materno" value={form.apellidoMaterno} onChange={(v) => setForm({ ...form, apellidoMaterno: v })} />
          <FormField label="Usuario *" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          <FormField label="Correo *" type="email" value={form.correo} onChange={(v) => setForm({ ...form, correo: v })} />
          <FormField label="Contraseña *" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <FormField label="Salario (quincenal)" type="number" value={form.salario} onChange={(v) => setForm({ ...form, salario: v })} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={btnOutline}>Cancelar</button>
          <button onClick={() => onSubmit({ ...form, salario: form.salario ? Number(form.salario) : 0, rol: { idRol: 3 } })}
            disabled={submitting} style={btnPrimary}>
            {submitting ? "Creando..." : "Crear integrante"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Cambiar Líder ───────────────────────────────────────────────────
function ChangeLeaderModal({ show, member, members, onClose, onSubmit, submitting }) {
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => { if (show) setSelectedId(""); }, [show]);
  if (!show) return null;

  const others = members.filter((m) => m.id !== member?.id);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 36, width: "90%", maxWidth: 520, position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666" }}>×</button>
        <h4 style={{ marginBottom: 12, color: "#1a3a4a", fontWeight: 700 }}>🔄 Cambiar Líder</h4>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
          Selecciona quién será el nuevo líder del equipo (esto cambiará tu rol a Integrante).
        </p>
        <label style={labelStyle}>Nuevo líder</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={inputStyle}>
          <option value="">-- Selecciona --</option>
          {others.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        {others.length === 0 && <p style={{ color: "#999", fontSize: 13 }}>No hay otros integrantes disponibles.</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={btnOutline}>Cancelar</button>
          <button onClick={() => onSubmit(selectedId)} disabled={submitting || !selectedId} style={btnPrimary}>
            {submitting ? "Cambiando..." : "Confirmar nuevo líder"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers de UI ─────────────────────────────────────────────────────────
const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 14, marginBottom: 4, boxSizing: "border-box" };
const btnPrimary = { padding: "9px 22px", borderRadius: 8, border: "none", background: "#2f7d78", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 };
const btnOutline = { padding: "9px 22px", borderRadius: 8, border: "1.5px solid #ccc", background: "#fff", color: "#555", fontWeight: 600, cursor: "pointer", fontSize: 14 };
const btnDanger = { padding: "9px 22px", borderRadius: 8, border: "none", background: "#e53935", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 };

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#333", fontWeight: 500, background: "#f8f8f8", padding: "8px 12px", borderRadius: 8 }}>{value ?? "—"}</div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", textarea = false }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          style={{ ...inputStyle, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}