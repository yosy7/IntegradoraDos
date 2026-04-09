import api from "./axios";

export const getTeams = async () => {
  const response = await api.get("/equipos");
  return response.data;
};

export const getTeamById = async (id) => {
  const response = await api.get(`/equipos/${id}`);
  return response.data;
};

export const getTeamMembers = async (id) => {
  const response = await api.get(`/equipos/${id}/integrantes`);
  return response.data;
};

export const getMyTeam = async () => {
  const response = await api.get("/equipos/mi-equipo");
  return response.data;
};

export const getMyMembers = async () => {
  const response = await api.get("/equipos/mis-integrantes");
  return response.data;
};

export const addMemberToTeam = async (idEquipo, idUsuario) => {
  const token = sessionStorage.getItem("token");
  const response = await api.post(
    `/equipo-usuario/asignar?idEquipo=${idEquipo}&idUsuario=${idUsuario}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const removeMemberFromTeam = async (idEquipo, idUsuario) => {
  const response = await api.delete(
    `/equipo-usuario/quitar?idEquipo=${idEquipo}&idUsuario=${idUsuario}`
  );
  return response.data;
};

export const changeTeamLeader = async (idEquipo, idLiderActual, idNuevoLider) => {
  const response = await api.post(`/equipo-usuario/cambiar-lider`, {
    idEquipo,
    idLiderActual,
    idNuevoLider,
  });
  return response.data;
};

export const createTeam = async (payload) => {
  try {
    console.log("ENVIANDO A BACKEND /equipos/crear-con-miembros:", payload);

    const response = await api.post("/equipos/crear-con-miembros", payload);

    console.log("RESPUESTA BACKEND CREAR EQUIPO:", response);
    return response.data;
  } catch (error) {
    console.error("ERROR EN teamService.createTeam:");
    console.error("STATUS:", error?.response?.status);
    console.error("DATA:", error?.response?.data);
    console.error("HEADERS:", error?.response?.headers);
    throw error;
  }
};

export const updateTeam = async (id, team) => {
  const response = await api.put(`/equipos/${id}`, team);
  return response.data;
};

export const deleteTeam = async (id) => {
  const response = await api.delete(`/equipos/${id}`);
  return response.data;
};