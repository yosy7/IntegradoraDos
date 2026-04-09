import api from "./axios";

export const getPayments = async () => {
  const response = await api.get("/pagos");
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await api.get(`/pagos/${id}`);
  return response.data;
};

export const getPaymentsByProyecto = async (idProyecto) => {
  const response = await api.get(`/pagos/proyecto/${idProyecto}`);
  return response.data;
};

export const getPaymentsByUsuario = async (idUsuario) => {
  const response = await api.get(`/pagos/usuario/${idUsuario}`);
  return response.data;
};

export const updatePayment = async (id, payment) => {
  const response = await api.put(`/pagos/${id}`, payment);
  return response.data;
};

// Realizar pago individual — admin puede cambiar las horas
export const realizarPayment = async (id, data) => {
  const response = await api.patch(`/pagos/${id}/realizar`, data);
  return response.data;
};

// Generar pagos PENDIENTE con horas y monto calculados automáticamente
export const generarPagosPeriodo = async (idProyecto, periodo) => {
  const response = await api.post("/pagos/generar-periodo", {
    idProyecto,
    periodo,
  });
  return response.data;
};

// Realizar TODOS los pagos pendientes de una vez — sin enviar nada
export const realizarTodosPendientes = async () => {
  const response = await api.patch("/pagos/realizar-todos");
  return response.data;
};

export const cambiarEstatusPayment = async (id, estatus) => {
  const response = await api.patch(`/pagos/${id}/estatus?estatus=${estatus}`);
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await api.delete(`/pagos/${id}`);
  return response.data;
};