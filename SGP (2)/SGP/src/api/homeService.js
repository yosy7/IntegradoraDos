import api from "./axios";

export const getUsers = async () => {
  const response = await api.get("/usuarios");
  return response.data;
};

export const getTeams = async () => {
  const response = await api.get("/equipos");
  return response.data;
};

export const getProjects = async () => {
  const response = await api.get("/proyectos");
  return response.data;
};