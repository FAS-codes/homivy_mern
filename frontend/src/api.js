import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("homivy-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// normalize error message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    err.userMessage = err.response?.data?.message || "Something went wrong. Please try again.";
    return Promise.reject(err);
  }
);

export const money = (n) => "£" + Number(n || 0).toFixed(2);
export default api;
