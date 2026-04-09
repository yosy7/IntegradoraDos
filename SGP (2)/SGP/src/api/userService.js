import api from "./axios";

export const getUsers = async () => {
  const response = await api.get("/usuarios");
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
};

export const createUser = async (user) => {
  const response = await api.post("/usuarios", user);
  return response.data;
};

export const updateUser = async (id, user) => {
  const response = await api.put(`/usuarios/${id}`, user);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};

export const getAvailableUsersForTeam = async () => {
  const response = await api.get("/usuarios/disponibles-equipo");
  return response.data;
};