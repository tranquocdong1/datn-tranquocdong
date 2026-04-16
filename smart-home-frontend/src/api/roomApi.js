import api from "./axios";

export const getRoomStatus = () => api.get("/room");
export const fanCmd = (cmd) => api.post("/room/fan", { cmd });
export const livingLedCmd = (cmd) => api.post("/room/living/led", { cmd });
export const bedroomLedCmd = (cmd) => api.post("/room/bedroom/led", { cmd });
export const alertCmd = (cmd) => api.post("/room/alert", { cmd });
export const getRoomLogs = (limit) => api.get(`/room/logs?limit=${limit}`);
