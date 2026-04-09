import { useEffect, useMemo, useState } from "react";
import "./leader.css";
import { getMyProjects } from "../../../api/projectService";
import { getPaymentsByProyecto, realizarPayment } from "../../../api/paymentService";

export default function LeaderPayments() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [horas, setHoras] = useState(0);
  const [tarifa, setTarifa] = useState(0);
  const [processing, setProcessing] = useState(false);

  const total = Number(horas || 0) * Number(tarifa || 0);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectsRes = await getMyProjects();
      const myProjects = Array.isArray(projectsRes?.data) ? projectsRes.data : Array.isArray(projectsRes) ? projectsRes : [];
      setProjects(myProjects);
      const nested = await Promise.all(myProjects.map((p) => getPaymentsByProyecto(p.idProyecto || p.id)));
      const merged = nested.flatMap((r) => Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []);
      setPayments(merged);
    } catch (e) {
      console.error(e);
      setProjects([]); setPayments([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const mapped = useMemo(() => payments.map((p) => ({
    id: p.idPago || p.id,
    persona: [p.usuario?.nombre, p.usuario?.apellidoPaterno, p.usuario?.apellidoMaterno].filter(Boolean).join(' ') || p.usuario?.nombre || 'Sin persona',
    proyecto: p.proyecto?.nombre || p.proyecto?.nombreProyecto || 'Sin proyecto',
    proyectoId: p.proyecto?.idProyecto || p.proyecto?.id || '',
    horas: p.horas || 0,
    tarifa: p.tarifa || 0,
    total: p.monto || 0,
    periodo: p.periodo || '—',
    realizadoPor: p.registradoPor?.username || '—',
    estatus: p.estatus || 'PENDIENTE',
    descripcion: p.descripcion || '',
  })), [payments]);

  const pendingPayments = mapped.filter((p) => String(p.estatus).toUpperCase() !== 'PAGADO');
  const selectedPayment = mapped.find((p) => String(p.id) === String(selectedPaymentId));

  useEffect(() => {
    if (selectedPayment) {
      setHoras(selectedPayment.horas || 0);
      setTarifa(selectedPayment.tarifa || 0);
    }
  }, [selectedPaymentId]);

  const handleRealizar = async (e) => {
    e.preventDefault();
    if (!selectedPaymentId) return alert('Selecciona un pago pendiente.');
    try {
      setProcessing(true);
      await realizarPayment(selectedPaymentId, {
        horas: Number(horas || 0),
        tarifa: Number(tarifa || 0),
        descripcion: selectedPayment?.descripcion || 'Pago realizado por líder',
      });
      setSelectedPaymentId(''); setHoras(0); setTarifa(0);
      await loadData();
    } catch (e2) {
      console.error(e2);
      alert(e2?.response?.data?.message || 'No se pudo realizar el pago.');
    } finally { setProcessing(false); }
  };

  return (
    <div className="leader-page">
      <div className="leader-section">
        <div className="leader-title"><i className="bi bi-wallet2"></i> Pagos</div>
        <div className="leader-table-wrap mb-4">
          <form onSubmit={handleRealizar} className="row g-3 align-items-end">
            <div className="col-12"><h5 className="mb-0">Realizar Pago</h5></div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Persona</label>
              <select className="form-select" value={selectedPaymentId} onChange={(e)=>setSelectedPaymentId(e.target.value)}>
                <option value="">Selecciona persona</option>
                {pendingPayments.map((p)=><option key={p.id} value={p.id}>{p.persona}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Proyecto</label>
              <input className="form-control" readOnly value={selectedPayment?.proyecto || ''} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Horas trabajadas</label>
              <input type="number" className="form-control" value={horas} onChange={(e)=>setHoras(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Tarifa</label>
              <input type="number" className="form-control" value={tarifa} onChange={(e)=>setTarifa(e.target.value)} />
            </div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <div className="fw-bold">Total a pagar <span className="ms-2">${Number(total).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})} MXN</span></div>
              <button className="leader-btn-primary" disabled={processing}>{processing ? 'Procesando...' : 'Realizar pago'}</button>
            </div>
          </form>
        </div>

        <div className="leader-table-wrap">
          <h5 className="mb-3">Historial de Pagos</h5>
          {loading ? <div className="leader-empty">Cargando pagos...</div> : (
            <div className="table-responsive">
              <table className="table leader-history-table align-middle">
                <thead>
                  <tr>
                    <th>Periodo</th><th>Proyecto</th><th>Persona</th><th>Horas</th><th>Tarifa por hora</th><th>Total Pagado</th><th>Pago realizado por</th>
                  </tr>
                </thead>
                <tbody>
                  {mapped.map((p)=>(<tr key={p.id}><td>{p.periodo}</td><td>{p.proyecto}</td><td>{p.persona}</td><td>{p.horas}</td><td>${Number(p.tarifa).toLocaleString('es-MX',{minimumFractionDigits:2})}</td><td>${Number(p.total).toLocaleString('es-MX',{minimumFractionDigits:2})}</td><td>{p.realizadoPor}</td></tr>))}
                  {!mapped.length && <tr><td colSpan="7" className="text-center py-4">No hay pagos para mostrar.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
