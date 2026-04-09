import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/sgp-api",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  console.log("TOKEN ENVIADO:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.error("⚠️ TOKEN NULL en petición a:", config.url);
  }

  return config;
});

export default api;