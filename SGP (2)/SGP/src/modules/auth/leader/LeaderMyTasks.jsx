import { useEffect, useMemo, useState } from "react";
import "./leader.css";
import { getMyTasks, updateTaskStatus } from "../../../api/taskService";

export default function LeaderMyTasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getMyTasks();
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setTasks(data);
    } catch (e) {
      console.error(e);
      setTasks([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const mapped = useMemo(() => tasks.map((t) => ({
    id: t.idTarea || t.id,
    nombre: t.nombre,
    prioridad: t.prioridad || 'ALTA',
    estado: t.estado || 'PENDIENTE',
    inicio: t.fechaInicio || '—',
    fin: t.fechaFin || '—',
  })), [tasks]);

  const changeStatus = async (id, estado) => {
    try {
      setProcessingId(id);
      await updateTaskStatus(id, estado);
      await loadData();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'No se pudo actualizar el estado.');
    } finally { setProcessingId(null); }
  };

  return (
    <div className="leader-page">
      <div className="leader-section">
        <div className="leader-title"><i className="bi bi-clipboard-check"></i> Mis tareas</div>
        {loading ? <div className="leader-empty">Cargando tareas...</div> : (
          <div className="leader-grid">
            {mapped.map((task) => (
              <div className="leader-task-card" key={task.id} style={{ maxWidth: 360 }}>
                <h5>{task.nombre}</h5>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <span className="small text-secondary">Prioridad:</span>
                  <span className={`leader-badge ${String(task.prioridad).toLowerCase()}`}>{task.prioridad}</span>
                  <span className="small text-secondary ms-2">Estado:</span>
                  <span className={`leader-badge ${String(task.estado).toLowerCase().replace(/\s+/g,'-')}`}>{task.estado}</span>
                </div>
                <div className="small mb-1"><i className="bi bi-calendar-event me-2"></i>Inicio {task.inicio}</div>
                <div className="small mb-3"><i className="bi bi-calendar-event me-2"></i>Fin {task.fin}</div>
                <hr />
                <div className="small text-secondary mb-2">Cambiar estado:</div>
                <div className="d-flex gap-2 flex-wrap">
                  {['PENDIENTE','EN PROGRESO','TERMINADO'].map((estado) => (
                    <button key={estado} className={`btn btn-sm ${task.estado===estado ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => changeStatus(task.id, estado)} disabled={processingId === task.id}>{estado}</button>
                  ))}
                </div>
              </div>
            ))}
            {!mapped.length && <div className="leader-empty">No tienes tareas asignadas.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
