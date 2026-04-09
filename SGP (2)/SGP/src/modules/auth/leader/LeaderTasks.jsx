import { useEffect, useMemo, useState } from "react";
import { getMyProjects } from "../../../api/projectService";
import { getMyMembers } from "../../../api/teamService";
import { createTask, deleteTask, getTasksByProject, updateTask } from "../../../api/taskService";

const PRIORIDAD_COLOR = {
  alta:  { bg: "#fdecea", color: "#c62828" },
  media: { bg: "#fff8e1", color: "#f57f17" },
  baja:  { bg: "#e8f5e9", color: "#2e7d32" },
};
const ESTADO_COLOR = {
  "pendiente":    { bg: "#f3e5f5", color: "#6a1b9a" },
  "en progreso":{ bg: "#e3f2fd", color: "#1565c0" },
  "terminado":    { bg: "#e8f5e9", color: "#2e7d32" },
};

function getBadge(map, key) {
  return map[(key||"").toLowerCase()] || { bg: "#eee", color: "#555" };
}

function Badge({ text, map }) {
  const s = getBadge(map, text);
  return (
    <span style={{
      fontSize: 11, padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 700,
    }}>{text}</span>
  );
}

function Modal({ show, title, children, onClose, maxWidth = 600 }) {
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

export default function LeaderTasks() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]     = useState([]);
  const [tasks, setTasks]     = useState([]);
  const [query, setQuery]     = useState("");
  const [estado, setEstado]   = useState("Todos");
  const [miembro, setMiembro] = useState("Todos");
  const [mode, setMode]       = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, membersRes] = await Promise.all([
        getMyProjects(),
        getMyMembers(),
      ]);

      const myProjects = Array.isArray(projectsRes?.data) ? projectsRes.data
        : Array.isArray(projectsRes) ? projectsRes : [];

      const teamMembers = Array.isArray(membersRes?.data) ? membersRes.data
        : Array.isArray(membersRes) ? membersRes : [];

      // Agrega al líder en la lista de asignables
      const liderId   = Number(sessionStorage.getItem("idUsuario") || 0);
      const liderName = sessionStorage.getItem("nombre") || "Líder";
      const liderYaEsta = teamMembers.some((u) => (u.idUsuario || u.id) === liderId);
      const usersConLider = liderYaEsta ? teamMembers : [
        { idUsuario: liderId, nombre: liderName, apellidoPaterno: "", apellidoMaterno: "" },
        ...teamMembers,
      ];

      setProjects(myProjects);
      setUsers(usersConLider);

      const nested = await Promise.all(
        myProjects.map((p) => getTasksByProject(p.idProyecto || p.id))
      );
      const merged = nested.flatMap((r) =>
        Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []
      );
      setTasks(merged);
    } catch (e) {
      console.error(e);
      setProjects([]); setUsers([]); setTasks([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const mappedUsers = useMemo(() => users.map((u) => ({
    id: u.idUsuario || u.id,
    nombre: [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(" ") || "Sin nombre",
  })), [users]);

  const mappedTasks = useMemo(() => tasks.map((t) => ({
    id:          t.idTarea || t.id,
    nombre:      t.nombre || "Sin nombre",
    descripcion: t.descripcion || "",
    prioridad:   t.prioridad || "MEDIA",
    estado:      t.estado || "PENDIENTE",
    fechaInicio: t.fechaInicio || "",
    fechaFin:    t.fechaFin || "",
    usuarioId:   t.usuarioAsignado?.idUsuario || t.usuarioAsignado?.id || "",
    usuario:     [t.usuarioAsignado?.nombre, t.usuarioAsignado?.apellidoPaterno, t.usuarioAsignado?.apellidoMaterno]
                   .filter(Boolean).join(" ") || "Sin asignar",
    proyectoId:  t.proyecto?.idProyecto || t.proyecto?.id || "",
    proyecto:    t.proyecto?.nombre || t.proyecto?.nombreProyecto || "Sin proyecto",
    raw: t,
  })), [tasks]);

  const filtered = useMemo(() => mappedTasks.filter((t) => {
    const q = query.toLowerCase();
    return (
      (!q || t.nombre.toLowerCase().includes(q) || t.descripcion.toLowerCase().includes(q)) &&
      (estado  === "Todos" || t.estado  === estado) &&
      (miembro === "Todos" || String(t.usuarioId) === miembro)
    );
  }), [mappedTasks, query, estado, miembro]);

  const open  = (m, task = null) => { setMode(m); setSelectedTask(task); };
  const close = () => { setMode(""); setSelectedTask(null); };

  const handleSave = async (form) => {
    try {
      setSubmitting(true);
      const payload = {
        nombre:         form.nombre,
        descripcion:    form.descripcion,
        fechaFin:       form.fechaFin || null,
        prioridad:      form.prioridad,
        estado:         form.estado,
        proyecto:       { idProyecto: Number(form.proyectoId) },
        usuarioAsignado: form.usuarioId ? { idUsuario: Number(form.usuarioId) } : null,
      };
      if (mode === "create") await createTask(payload);
      else                   await updateTask(selectedTask.id, payload);
      close();
      await loadData();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "No se pudo guardar la tarea.");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await deleteTask(selectedTask.id);
      close();
      await loadData();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "No se pudo eliminar la tarea.");
    } finally { setSubmitting(false); }
  };

  const ESTADOS = ["PENDIENTE", "EN PROGRESO", "TERMINADO"];

  return (
    <div style={{ padding: "0 8px" }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h4 style={{ color: "#1a3a4a", fontWeight: 700, margin: 0 }}>
          <i className="bi bi-clipboard-check me-2"></i>Asignación de Tareas
        </h4>
        <button onClick={() => open("create")} style={{
          padding: "9px 20px", borderRadius: 8, border: "none",
          background: "#2f7d78", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14,
        }}>+ Nueva tarea</button>
      </div>

      {/* ── FILTROS ── */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 24,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "grid",
        gridTemplateColumns: "1fr 200px 200px", gap: 16, alignItems: "end",
      }}>
        <div>
          <label style={labelStyle}>Buscar tarea</label>
          <input className="form-control" placeholder="Nombre o descripción..."
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Estado</label>
          <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option>Todos</option>
            {ESTADOS.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Miembro</label>
          <select className="form-select" value={miembro} onChange={(e) => setMiembro(e.target.value)}>
            <option value="Todos">Todos</option>
            {mappedUsers.map((u) => <option key={u.id} value={String(u.id)}>{u.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* ── CARDS ── */}
      {loading ? (
        <p className="text-muted">Cargando tareas...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, color: "#999" }}>
          <i className="bi bi-clipboard-x" style={{ fontSize: 48, display: "block", marginBottom: 12 }}></i>
          No hay tareas para mostrar.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 340px))",
          gap: 16,
          justifyContent: "start",
        }}>
          {filtered.map((task) => (
            <div key={task.id} style={{
              background: "#fff", borderRadius: 12, padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0",
            }}>
              {/* nombre + botones */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h6 style={{ fontWeight: 700, color: "#1a3a4a", margin: 0, flex: 1, marginRight: 8 }}>{task.nombre}</h6>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => open("edit", task)} style={{
                    width: 30, height: 30, borderRadius: 6, border: "none",
                    background: "#1565c0", color: "#fff", cursor: "pointer", fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}><i className="bi bi-pencil-fill"></i></button>
                  <button onClick={() => open("delete", task)} style={{
                    width: 30, height: 30, borderRadius: 6, border: "none",
                    background: "#e53935", color: "#fff", cursor: "pointer", fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}><i className="bi bi-trash-fill"></i></button>
                </div>
              </div>

              {task.descripcion && (
                <p style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>{task.descripcion}</p>
              )}

              {/* badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                <Badge text={task.prioridad} map={PRIORIDAD_COLOR} />
                <Badge text={task.estado}    map={ESTADO_COLOR} />
              </div>

              {/* fechas */}
              <div style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>
                <span>Inicio: {task.fechaInicio || "—"}</span>
                <span style={{ marginLeft: 14 }}>Fin: {task.fechaFin || "—"}</span>
              </div>

              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                <div style={{ fontSize: 12, color: "#666" }}>
                  <i className="bi bi-person me-1"></i>{task.usuario}
                </div>
                <div style={{ fontSize: 12, color: "#aaa" }}>
                  <i className="bi bi-folder me-1"></i>{task.proyecto}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODALES ── */}
      <TaskFormModal
        show={mode === "create" || mode === "edit"}
        title={mode === "create" ? "Nueva Tarea" : "Editar Tarea"}
        onClose={close} onSubmit={handleSave}
        task={selectedTask} projects={projects} users={mappedUsers} submitting={submitting}
      />
      <DeleteTaskModal
        show={mode === "delete"} task={selectedTask}
        onClose={close} onConfirm={handleDelete} submitting={submitting}
      />
    </div>
  );
}

// ─── Modal Crear/Editar Tarea ──────────────────────────────────────────────
function TaskFormModal({ show, title, onClose, onSubmit, task, projects, users, submitting }) {
  const [form, setForm] = useState({
    nombre: "", prioridad: "ALTA", estado: "PENDIENTE",
    usuarioId: "", proyectoId: "", fechaFin: "", descripcion: "",
  });

  useEffect(() => {
    setForm({
      nombre:      task?.nombre      || "",
      prioridad:   task?.prioridad   || "ALTA",
      estado:      task?.estado      || "PENDIENTE",
      usuarioId:   task?.usuarioId   ? String(task.usuarioId) : "",
      proyectoId:  task?.proyectoId  ? String(task.proyectoId) : String(projects[0]?.idProyecto || projects[0]?.id || ""),
      fechaFin:    task?.fechaFin    || "",
      descripcion: task?.descripcion || "",
    });
  }, [task, show, projects]);

  if (!show) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal show={show} title={title} onClose={onClose} maxWidth={620}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <FormField label="Nombre de la tarea *" value={form.nombre} onChange={(v) => set("nombre", v)} />
        </div>
        <SelectField label="Prioridad" value={form.prioridad} onChange={(v) => set("prioridad", v)}
          options={["ALTA","MEDIA","BAJA"]} />
        <SelectField label="Estado" value={form.estado} onChange={(v) => set("estado", v)}
          options={["PENDIENTE","EN PROGRESO","TERMINADO"]} />
        <SelectField label="Asignar a" value={form.usuarioId} onChange={(v) => set("usuarioId", v)}
          options={[{label:"-- Sin asignar --", value:""}, ...users.map((u) => ({label:u.nombre, value:String(u.id)}))]} />
        <SelectField label="Proyecto" value={form.proyectoId} onChange={(v) => set("proyectoId", v)}
          options={projects.map((p) => ({label: p.nombre||p.nombreProyecto, value: String(p.idProyecto||p.id)}))} />
        <div style={{ gridColumn: "1 / -1" }}>
          <FormField label="Fecha de fin" type="date" value={form.fechaFin} onChange={(v) => set("fechaFin", v)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Descripción</label>
          <textarea className="form-control" rows={3} value={form.descripcion}
            onChange={(e) => set("descripcion", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
        <button onClick={onClose} style={btnOutline}>Cancelar</button>
        <button onClick={() => onSubmit(form)} disabled={submitting} style={btnPrimary}>
          {submitting ? "Guardando..." : title}
        </button>
      </div>
    </Modal>
  );
}

function DeleteTaskModal({ show, task, onClose, onConfirm, submitting }) {
  return (
    <Modal show={show} title="Eliminar tarea" onClose={onClose} maxWidth={480}>
      <p style={{ color: "#555", fontSize: 15, marginBottom: 24 }}>
        ¿Estás seguro de que deseas eliminar la tarea <strong>"{task?.nombre}"</strong>?
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={onClose} style={btnOutline}>Cancelar</button>
        <button onClick={onConfirm} disabled={submitting} style={btnDanger}>
          {submitting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const labelStyle  = { display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 };
const btnPrimary  = { padding: "9px 22px", borderRadius: 8, border: "none", background: "#2f7d78", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 };
const btnOutline  = { padding: "9px 22px", borderRadius: 8, border: "1.5px solid #ccc", background: "#fff", color: "#555", fontWeight: 600, cursor: "pointer", fontSize: 14 };
const btnDanger   = { padding: "9px 22px", borderRadius: 8, border: "none", background: "#e53935", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 };

function FormField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} className="form-control" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  const opts = options.map((o) => typeof o === "string" ? { label: o, value: o } : o);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}