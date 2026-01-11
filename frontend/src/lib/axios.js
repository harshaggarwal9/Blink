import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Attach JWT automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
