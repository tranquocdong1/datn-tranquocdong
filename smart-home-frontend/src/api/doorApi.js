import api from "./axios";

export const getDoorStatus = () => api.get("/door");
export const sendDoorCmd = (cmd) => api.post("/door/cmd", { cmd });
export const getDoorLogs = (limit) => api.get(`/door/logs?limit=${limit}`);
export const addUID = (uid) => api.post("/door/uid/add", { uid });
export const learnMode = () => api.post("/door/uid/add", { mode: "learn" });
export const removeUID = (uid) => api.delete("/door/uid", { data: { uid } });
export const listUID = () => api.get("/door/uid/list");
