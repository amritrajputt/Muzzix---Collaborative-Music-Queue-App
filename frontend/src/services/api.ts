import axios from "axios";

export const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && envUrl !== "http://localhost:3000") {
    return envUrl;
  }
  const hostname = window.location.hostname;
  // If accessing via local network IP (e.g. 192.168.1.x)
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)) {
      return `http://${hostname}:3000`;
    }
  }
  return envUrl || "http://localhost:3000";
};

const api = axios.create({
  baseURL: getBackendUrl(),
});

export default api;
