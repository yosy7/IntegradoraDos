import api from "./axios";

export const getTasks = async () => {
  const response = await api.get("/tareas");
  return response.data;
};

export const getTasksByProject = async (idProyecto) => {
  const response = await api.get(`/tareas/proyecto/${idProyecto}`);
  return response.data;
};

export const getMyTasks = async () => {
  const response = await api.get("/tareas/mis-tareas");
  return response.data;
};

export const createTask = async (task) => {
  const response = await api.post("/tareas", task);
  return response.data;
};

export const updateTask = async (id, task) => {
  const response = await api.put(`/tareas/${id}`, task);
  return response.data;
};

export const updateTaskStatus = async (id, estado) => {
  const response = await api.patch(`/tareas/${id}/estado?estado=${encodeURIComponent(estado)}`);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tareas/${id}`);
  return response.data;
};